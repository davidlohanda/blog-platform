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

  // Replace plans for a publication: soft-delete old plans, insert new ones.
  // Plans with existing subscriptions cannot be hard-deleted (FK constraint),
  // so they are deactivated instead. New plans are always inserted fresh.
  replacePlans(
    publicationId: string,
    plans: Array<{ durationMonths: number; price: number; isActive: boolean }>,
  ) {
    return prisma.$transaction(async (tx) => {
      // Find plans that have at least one subscription (cannot delete)
      const plansWithSubs = await tx.subscriptionPlan.findMany({
        where: { publicationId, subscriptions: { some: {} } },
        select: { id: true },
      });
      const lockedIds = new Set(plansWithSubs.map((p) => p.id));

      // Hard-delete plans with no subscriptions
      await tx.subscriptionPlan.deleteMany({
        where: { publicationId, id: { notIn: [...lockedIds] } },
      });

      // Soft-deactivate plans that are locked (have subscriptions)
      if (lockedIds.size > 0) {
        await tx.subscriptionPlan.updateMany({
          where: { publicationId, id: { in: [...lockedIds] } },
          data: { isActive: false },
        });
      }

      // Insert incoming plans as new rows
      await tx.subscriptionPlan.createMany({
        data: plans.map((p) => ({
          publicationId,
          durationMonths: p.durationMonths,
          price: p.price,
          isActive: p.isActive,
        })),
      });

      // Return only active plans (exclude soft-deleted locked ones)
      return tx.subscriptionPlan.findMany({
        where: { publicationId, isActive: true },
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
