import { adminRepository } from './admin.repository';

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
};
