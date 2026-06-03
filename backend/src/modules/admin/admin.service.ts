import { adminRepository } from './admin.repository';
import { publicationRepository } from '../publication/publication.repository';
import { authRepository } from '../auth/auth.repository';
import { subscriptionRepository } from '../subscription/subscription.repository';
import { emailService } from '../email/email.service';
import { AppError } from '../../lib/AppError';
import { signAccessToken } from '../../lib/jwt';
import { config } from '../../config';
import { log } from '../../lib/logger';
import { hash } from '../../lib/password';
import { randomUUID } from 'crypto';

export const adminService = {
  async getOverview() {
    const [totalUsers, totalPublications, revenue] = await Promise.all([
      adminRepository.countUsers(),
      adminRepository.countPublications(),
      adminRepository.totalRevenue(),
    ]);

    return {
      totalUsers,
      totalPublications,
      totalRevenue: Number(revenue._sum.grossAmount ?? 0),
      platformFeeCollected: Number(revenue._sum.platformFee ?? 0),
    };
  },

  async listPublications(page: number, limit: number) {
    const [publications, total] = await Promise.all([
      adminRepository.listPublications(page, limit),
      adminRepository.countPublicationsTotal(),
    ]);

    const data = publications.map((pub) => {
      const owner = pub.authors[0]?.user ?? null;
      const activeRevenue = pub.subscriptions.reduce(
        (acc, s) => ({
          gross: acc.gross + Number(s.grossAmount),
          fee: acc.fee + Number(s.platformFee),
        }),
        { gross: 0, fee: 0 },
      );
      return {
        id: pub.id,
        slug: pub.slug,
        name: pub.name,
        logoUrl: pub.logoUrl,
        platformFeePercent: Number(pub.platformFeePercent),
        status: pub.status,
        createdAt: pub.createdAt,
        owner,
        activeSubscribers: pub.subscriptions.length,
        activeMRR: activeRevenue.gross,
        activePlatformFee: activeRevenue.fee,
        totalSubscriptions: pub._count.subscriptions,
        totalArticles: pub._count.articles,
      };
    });

    return { data, total, page, limit };
  },

  async listUsers(page: number, limit: number) {
    const [users, total] = await Promise.all([
      adminRepository.listUsers(page, limit),
      adminRepository.countUsersTotal(),
    ]);

    return { data: users, total, page, limit };
  },

  // Story 15.1 — update platform fee
  async updateFee(publicationId: string, feePercent: number) {
    const pub = await publicationRepository.findById(publicationId);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');
    if (feePercent < 0 || feePercent > 100) {
      throw AppError.badRequest('Fee harus antara 0 dan 100', 'INVALID_FEE');
    }
    return adminRepository.updateFee(publicationId, feePercent);
  },

  // Story 15.2 — impersonate owner
  async impersonate(targetUserId: string, adminId: string) {
    const target = await authRepository.findById(targetUserId);
    if (!target) throw AppError.notFound('User tidak ditemukan');

    // Generate impersonation access token (short-lived, no refresh token)
    const accessToken = signAccessToken({
      userId: target.id,
      email: target.email,
      role: target.role,
      isImpersonation: true,
      impersonatedBy: adminId,
    });

    log.info(`[Admin] Impersonation: admin ${adminId} → user ${targetUserId}`);

    return {
      accessToken,
      user: {
        id: target.id,
        email: target.email,
        name: target.name,
        role: target.role,
        avatarUrl: target.avatarUrl,
      },
    };
  },

  // Story 15.3 — suspend publication
  async suspendPublication(publicationId: string, level: 1 | 2, reason: string) {
    const pub = await publicationRepository.findById(publicationId);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');
    if (pub.status === 'pending_deletion') {
      throw AppError.conflict('Publication sedang dalam proses penghapusan', 'PENDING_DELETION');
    }

    const newStatus = level === 1 ? 'suspended_soft' : 'suspended_hard';
    await adminRepository.updateStatus(publicationId, newStatus, reason);

    // Get owner for email
    const authors = await publicationRepository.listAuthors(publicationId);
    const owner = authors.find((a) => a.role === 'owner');

    if (owner) {
      await emailService.sendPublicationSuspended({
        to: owner.user.email,
        name: owner.user.name,
        publicationName: pub.name,
        reason,
        level,
      });
    }

    // Level 2: refund all active subscribers
    if (level === 2) {
      await this._refundAllSubscribers(publicationId, pub.name);
    }

    return { status: newStatus };
  },

  async unsuspendPublication(publicationId: string) {
    const pub = await publicationRepository.findById(publicationId);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');

    await adminRepository.updateStatus(publicationId, 'active', null);

    const authors = await publicationRepository.listAuthors(publicationId);
    const owner = authors.find((a) => a.role === 'owner');

    if (owner) {
      await emailService.sendPublicationUnsuspended({
        to: owner.user.email,
        name: owner.user.name,
        publicationName: pub.name,
      });
    }

    return { status: 'active' };
  },

  // Pro-rata refund helper — marks subscriptions as cancelled and logs refund
  async _refundAllSubscribers(publicationId: string, publicationName: string) {
    const activeSubscriptions =
      await subscriptionRepository.findAllActiveForPublication(publicationId);
    const now = new Date();

    for (const sub of activeSubscriptions) {
      if (!sub.startedAt || !sub.expiresAt) continue;

      const totalDays = Math.ceil(
        (sub.expiresAt.getTime() - sub.startedAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      const daysRemaining = Math.max(
        0,
        Math.ceil((sub.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      );
      const refundAmount =
        totalDays > 0 ? Math.round((Number(sub.grossAmount) * daysRemaining) / totalDays) : 0;

      log.info(
        `[Admin] Refund queued: sub ${sub.id} — Rp ${refundAmount} (${daysRemaining}/${totalDays} days)`,
      );

      // Mark as cancelled (actual Midtrans refund would be called here in production)
      await subscriptionRepository.updateSubscription(sub.id, { status: 'cancelled' });

      // Notify member
      if (refundAmount > 0) {
        await emailService.sendSubscriptionExpired({
          to: sub.user.email,
          name: sub.user.name,
          publicationName,
          resubscribeUrl: `${config.platform.frontendUrl}/${publicationName}`,
        });
      }
    }
  },

  async listPlatformStaff() {
    return adminRepository.listPlatformStaff();
  },

  async createPlatformStaff(email: string, name: string) {
    const existing = await authRepository.findByEmail(email);
    if (existing) throw AppError.conflict('Email sudah terdaftar', 'EMAIL_TAKEN');

    const tempPassword = randomUUID().slice(0, 12);
    const passwordHash = await hash(tempPassword);
    const staff = await adminRepository.createPlatformStaff({ email, name, passwordHash });

    // Send welcome email with temp password
    await emailService
      .sendAdminWelcome({
        to: email,
        name,
        tempPassword,
        loginUrl: `${config.platform.frontendUrl}/admin/login`,
      })
      .catch(() => {});

    return staff;
  },

  async deletePlatformStaff(userId: string, requesterId: string) {
    if (userId === requesterId) throw AppError.badRequest('Tidak bisa hapus akun sendiri');
    const user = await adminRepository.findById(userId);
    if (!user) throw AppError.notFound('User tidak ditemukan');
    if (user.role !== 'platform_admin')
      throw AppError.badRequest('Hanya platform_admin yang bisa dihapus');
    return adminRepository.deletePlatformStaff(userId);
  },

  async updatePlatformStaffRole(
    userId: string,
    role: 'platform_admin' | 'platform_owner',
    requesterId: string,
  ) {
    if (userId === requesterId) throw AppError.badRequest('Tidak bisa ubah role sendiri');
    const user = await adminRepository.findById(userId);
    if (!user) throw AppError.notFound('User tidak ditemukan');
    if (user.role !== 'platform_admin' && user.role !== 'platform_owner') {
      throw AppError.badRequest('User bukan platform staff');
    }
    return adminRepository.updatePlatformStaffRole(userId, role);
  },
};
