import { prisma } from '../../config/database.config';

export const analyticsService = {
  async getOverview(publicationId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      activeSubscribers,
      newThisMonth,
      newLastMonth,
      activeSubsWithPlan,
      viewsAggregate,
      publishedArticles,
      topArticles,
    ] = await Promise.all([
      // Active subscribers right now
      prisma.subscription.count({
        where: { publicationId, status: 'active', expiresAt: { gt: now } },
      }),
      // New activations this month
      prisma.subscription.count({
        where: { publicationId, status: 'active', startedAt: { gte: startOfMonth } },
      }),
      // New activations last month
      prisma.subscription.count({
        where: {
          publicationId,
          status: 'active',
          startedAt: { gte: startOfPrevMonth, lt: startOfMonth },
        },
      }),
      // Active subscriptions with plan (for MRR)
      prisma.subscription.findMany({
        where: { publicationId, status: 'active', expiresAt: { gt: now } },
        include: { plan: { select: { price: true, durationMonths: true } } },
      }),
      // Total article views
      prisma.article.aggregate({
        where: { publicationId, deletedAt: null },
        _sum: { viewsCount: true },
      }),
      // Total published articles
      prisma.article.count({
        where: { publicationId, status: 'published', deletedAt: null },
      }),
      // Top articles by views
      prisma.article.findMany({
        where: { publicationId, status: 'published', deletedAt: null },
        orderBy: { viewsCount: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          viewsCount: true,
          likesCount: true,
          publishedAt: true,
          visibility: true,
        },
      }),
    ]);

    // MRR: sum monthly price for all active subscriptions
    const mrr = activeSubsWithPlan.reduce((sum, sub) => sum + Number(sub.plan.price), 0);

    return {
      activeSubscribers,
      subscriberDelta: newThisMonth - newLastMonth,
      newThisMonth,
      mrr,
      totalViews: viewsAggregate._sum.viewsCount ?? 0,
      totalArticles: publishedArticles,
      topArticles,
    };
  },

  async getSubscriberChart(publicationId: string, range: '30d' | '6m' | '12m') {
    const now = new Date();

    if (range === '30d') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const activations = await prisma.subscription.findMany({
        where: {
          publicationId,
          status: 'active',
          startedAt: { gte: thirtyDaysAgo },
        },
        select: { startedAt: true },
      });

      // Build day-keyed map
      const grouped: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        grouped[d.toISOString().slice(0, 10)] = 0;
      }
      activations.forEach((a) => {
        if (a.startedAt) {
          const key = a.startedAt.toISOString().slice(0, 10);
          if (key in grouped) grouped[key]++;
        }
      });

      return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    }

    const months = range === '6m' ? 6 : 12;
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const activations = await prisma.subscription.findMany({
      where: {
        publicationId,
        status: 'active',
        startedAt: { gte: startDate },
      },
      select: { startedAt: true },
    });

    const grouped: Record<string, number> = {};
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] = 0;
    }
    activations.forEach((a) => {
      if (a.startedAt) {
        const key = `${a.startedAt.getFullYear()}-${String(a.startedAt.getMonth() + 1).padStart(2, '0')}`;
        if (key in grouped) grouped[key]++;
      }
    });

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  },
};
