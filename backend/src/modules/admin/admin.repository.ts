import { prisma } from '../../config/database.config';

export const adminRepository = {
  countUsers() {
    return prisma.user.count();
  },

  countPublications() {
    return prisma.publication.count();
  },

  totalRevenue() {
    return prisma.subscription.aggregate({
      _sum: { grossAmount: true, platformFee: true },
      where: { status: { in: ['active', 'expired'] } },
    });
  },

  listPublications(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return prisma.publication.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        name: true,
        logoUrl: true,
        platformFeePercent: true,
        createdAt: true,
        authors: {
          where: { role: 'owner' },
          select: {
            user: { select: { id: true, name: true, email: true } },
          },
          take: 1,
        },
        subscriptions: {
          where: { status: 'active', expiresAt: { gt: new Date() } },
          select: { grossAmount: true, platformFee: true },
        },
        _count: { select: { subscriptions: true, articles: true } },
      },
    });
  },

  countPublicationsTotal() {
    return prisma.publication.count();
  },

  listUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
        _count: { select: { subscriptions: true, publications: true } },
      },
    });
  },

  countUsersTotal() {
    return prisma.user.count();
  },
};
