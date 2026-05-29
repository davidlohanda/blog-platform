import { prisma } from '../../config/database.config';
import type { Prisma, SubscriptionStatus } from '@prisma/client';

export const subscriptionRepository = {
  // ─── Plans ───────────────────────────────────────────────
  listPlans(publicationId: string, activeOnly = false) {
    return prisma.subscriptionPlan.findMany({
      where: { publicationId, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: { durationMonths: 'asc' },
    });
  },

  findPlanById(publicationId: string, planId: string) {
    return prisma.subscriptionPlan.findFirst({ where: { id: planId, publicationId } });
  },

  // Replace all plans for a publication atomically
  replacePlans(
    publicationId: string,
    plans: Array<{ durationMonths: number; price: number; isActive: boolean }>,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.subscriptionPlan.deleteMany({ where: { publicationId } });
      await tx.subscriptionPlan.createMany({
        data: plans.map((p) => ({
          publicationId,
          durationMonths: p.durationMonths,
          price: p.price,
          isActive: p.isActive,
        })),
      });
      return tx.subscriptionPlan.findMany({
        where: { publicationId },
        orderBy: { durationMonths: 'asc' },
      });
    });
  },

  // ─── Subscriptions ───────────────────────────────────────
  createSubscription(data: Prisma.SubscriptionUncheckedCreateInput) {
    return prisma.subscription.create({ data });
  },

  findSubscriptionById(id: string) {
    return prisma.subscription.findUnique({ where: { id } });
  },

  findByPaymentId(paymentId: string) {
    return prisma.subscription.findFirst({ where: { paymentId } });
  },

  updateSubscription(id: string, data: Prisma.SubscriptionUncheckedUpdateInput) {
    return prisma.subscription.update({ where: { id }, data });
  },

  // Active subscription for a user in a publication
  findActiveForUser(userId: string, publicationId: string) {
    return prisma.subscription.findFirst({
      where: {
        userId,
        publicationId,
        status: 'active',
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: 'desc' },
    });
  },

  findCurrentForUser(userId: string, publicationId: string) {
    return prisma.subscription.findFirst({
      where: { userId, publicationId, status: { in: ['active', 'pending'] } },
      orderBy: { createdAt: 'desc' },
      include: { plan: true, publication: { select: { id: true, name: true, slug: true } } },
    });
  },

  historyForUser(userId: string) {
    return prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true, publication: { select: { id: true, name: true, slug: true } } },
    });
  },

  setStatus(id: string, status: SubscriptionStatus) {
    return prisma.subscription.update({ where: { id }, data: { status } });
  },
};
