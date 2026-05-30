import { subscriptionRepository } from './subscription.repository';
import { publicationRepository } from '../publication/publication.repository';
import { authRepository } from '../auth/auth.repository';
import { midtransService } from './midtrans.service';
import { emailService } from '../email/email.service';
import { AppError } from '../../lib/AppError';
import { config } from '../../config';
import { redis } from '../../config/redis.config';
import type { UpdatePlansInput } from './subscription.schema';

const MEMBER_CACHE_TTL = 5 * 60; // 5 minutes

interface PlanWithSavings {
  id: string;
  durationMonths: number;
  price: number;
  total: number;
  isActive: boolean;
  savingsPercent: number;
}

export const subscriptionService = {
  async listPlans(publicationId: string, activeOnly: boolean): Promise<PlanWithSavings[]> {
    const plans = await subscriptionRepository.listPlans(publicationId, activeOnly);

    // Monthly price of the 1-month plan is the baseline for savings calc
    const oneMonth = plans.find((p) => p.durationMonths === 1);
    const basePrice = oneMonth ? Number(oneMonth.price) : null;

    return plans.map((p) => {
      const price = Number(p.price); // per-month price
      const savingsPercent =
        basePrice && p.durationMonths > 1 ? Math.round((1 - price / basePrice) * 100) : 0;
      return {
        id: p.id,
        durationMonths: p.durationMonths,
        price,
        total: price * p.durationMonths,
        isActive: p.isActive,
        savingsPercent: Math.max(0, savingsPercent),
      };
    });
  },

  async updatePlans(publicationId: string, input: UpdatePlansInput) {
    const pub = await publicationRepository.findById(publicationId);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');
    await subscriptionRepository.replacePlans(publicationId, input.plans);
    return this.listPlans(publicationId, false);
  },

  async createOrder(publicationId: string, userId: string, planId: string) {
    const plan = await subscriptionRepository.findPlanById(publicationId, planId);
    if (!plan || !plan.isActive) throw AppError.notFound('Paket tidak ditemukan atau tidak aktif');

    const user = await authRepository.findById(userId);
    if (!user) throw AppError.notFound('User tidak ditemukan');

    // Block double active subscription
    const active = await subscriptionRepository.findActiveForUser(userId, publicationId);
    if (active)
      throw AppError.conflict('Kamu sudah punya subscription aktif', 'ALREADY_SUBSCRIBED');

    const monthlyPrice = Number(plan.price);
    const grossAmount = monthlyPrice * plan.durationMonths;
    const platformFee = Math.round((grossAmount * config.platform.feePercent) / 100);
    const netAmount = grossAmount - platformFee;

    // Create pending subscription first to get an order id
    const subscription = await subscriptionRepository.createSubscription({
      publicationId,
      userId,
      planId,
      status: 'pending',
      grossAmount,
      platformFee,
      netAmount,
    });

    const orderId = `LNT-${subscription.id}`;
    const snapToken = await midtransService.createTransaction({
      orderId,
      grossAmount,
      customerName: user.name,
      customerEmail: user.email,
      itemName: `Subscription ${plan.durationMonths} bulan`,
    });

    // Store order id reference on the subscription
    await subscriptionRepository.updateSubscription(subscription.id, { paymentId: orderId });

    return {
      snapToken,
      subscriptionId: subscription.id,
      grossAmount,
      clientKey: config.midtrans.clientKey,
    };
  },

  async handleWebhook(payload: {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
    transaction_status: string;
    payment_type?: string;
    fraud_status?: string;
  }) {
    const valid = midtransService.verifySignature(
      payload.order_id,
      payload.status_code,
      payload.gross_amount,
      payload.signature_key,
    );
    if (!valid) throw AppError.unauthorized('Signature tidak valid', 'INVALID_SIGNATURE');

    const subscription = await subscriptionRepository.findByPaymentId(payload.order_id);
    if (!subscription) throw AppError.notFound('Subscription tidak ditemukan');

    // Idempotency: skip if already finalized
    if (subscription.status === 'active' || subscription.status === 'cancelled') {
      return { message: 'Already processed' };
    }

    const status = payload.transaction_status;
    const plan = await subscriptionRepository.findPlanById(
      subscription.publicationId,
      subscription.planId,
    );

    if ((status === 'settlement' || status === 'capture') && payload.fraud_status !== 'deny') {
      const startedAt = new Date();
      const expiresAt = new Date(startedAt);
      expiresAt.setMonth(expiresAt.getMonth() + (plan?.durationMonths ?? 1));

      await subscriptionRepository.updateSubscription(subscription.id, {
        status: 'active',
        startedAt,
        expiresAt,
        paymentMethod: payload.payment_type,
      });

      // Invalidate member cache so access check picks up new status
      await redis.del(`member:${subscription.userId}:${subscription.publicationId}`);

      // Send subscription confirmation email
      const [subUser, subPub] = await Promise.all([
        authRepository.findById(subscription.userId),
        publicationRepository.findById(subscription.publicationId),
      ]);
      if (subUser && subPub && expiresAt) {
        const expiresAtStr = expiresAt.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        await emailService.sendSubscriptionConfirmed({
          to: subUser.email,
          name: subUser.name,
          publicationName: subPub.name,
          planDurationMonths: plan?.durationMonths ?? 1,
          expiresAt: expiresAtStr,
        });
      }
    } else if (status === 'deny' || status === 'cancel' || status === 'expire') {
      await subscriptionRepository.setStatus(subscription.id, 'expired');

      // Send subscription expired email
      if (status === 'expire') {
        const [subUser, subPub] = await Promise.all([
          authRepository.findById(subscription.userId),
          publicationRepository.findById(subscription.publicationId),
        ]);
        if (subUser && subPub) {
          const frontendUrl = config.platform.frontendUrl;
          await emailService.sendSubscriptionExpired({
            to: subUser.email,
            name: subUser.name,
            publicationName: subPub.name,
            resubscribeUrl: `${frontendUrl}/subscribe?pub=${subPub.slug}`,
          });
        }
      }
    }
    // 'pending' status: leave as-is

    return { message: 'Webhook processed' };
  },

  async getMine(userId: string, publicationId: string) {
    const sub = await subscriptionRepository.findCurrentForUser(userId, publicationId);
    return sub;
  },

  async getHistory(userId: string) {
    return subscriptionRepository.historyForUser(userId);
  },

  async cancel(userId: string, subscriptionId: string) {
    const sub = await subscriptionRepository.findSubscriptionById(subscriptionId);
    if (!sub) throw AppError.notFound('Subscription tidak ditemukan');
    if (sub.userId !== userId) throw AppError.forbidden('Bukan subscription kamu');
    if (sub.status !== 'active')
      throw AppError.badRequest('Hanya subscription aktif yang bisa dibatalkan');

    // Cancel: keep access until expiry, just mark cancelled
    await subscriptionRepository.setStatus(subscriptionId, 'cancelled');
    await redis.del(`member:${userId}:${sub.publicationId}`);
    return { message: 'Subscription dibatalkan. Akses tetap aktif hingga periode berakhir.' };
  },

  // Used by member.middleware — cached
  async isActiveMember(userId: string, publicationId: string): Promise<boolean> {
    const cacheKey = `member:${userId}:${publicationId}`;
    const cached = await redis.get(cacheKey);
    if (cached !== null) return cached === '1';

    const active = await subscriptionRepository.findActiveForUser(userId, publicationId);
    const isMember = !!active;
    await redis.setex(cacheKey, MEMBER_CACHE_TTL, isMember ? '1' : '0');
    return isMember;
  },
};
