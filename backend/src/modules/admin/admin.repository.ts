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
        status: true,
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

  updateFee(publicationId: string, feePercent: number) {
    return prisma.publication.update({
      where: { id: publicationId },
      data: { platformFeePercent: feePercent },
      select: { id: true, platformFeePercent: true },
    });
  },

  updateStatus(publicationId: string, status: string, reason: string | null) {
    return prisma.publication.update({
      where: { id: publicationId },
      data: {
        status: status as import('@prisma/client').PublicationStatus,
        suspendReason: reason,
      },
    });
  },

  listPlatformStaff() {
    return prisma.user.findMany({
      where: { role: { in: ['platform_admin', 'platform_owner'] } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  },

  createPlatformStaff(data: { email: string; name: string; passwordHash: string }) {
    return prisma.user.create({
      data: { ...data, role: 'platform_admin', emailVerifiedAt: new Date() },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  },

  deletePlatformStaff(userId: string) {
    return prisma.user.delete({ where: { id: userId } });
  },

  updatePlatformStaffRole(userId: string, role: 'platform_admin' | 'platform_owner') {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
  },

  findById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  },
};
