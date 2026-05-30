import { prisma } from '../../config/database.config';

export const seriesRepository = {
  create(data: {
    publicationId: string;
    authorId: string;
    title: string;
    slug: string;
    description?: string | null;
    coverImageUrl?: string | null;
  }) {
    return prisma.series.create({ data });
  },

  findById(publicationId: string, id: string) {
    return prisma.series.findFirst({
      where: { id, publicationId },
      include: {
        articles: {
          orderBy: { orderIndex: 'asc' },
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImageUrl: true,
                status: true,
                visibility: true,
                readingTime: true,
                publishedAt: true,
              },
            },
          },
        },
      },
    });
  },

  findBySlug(publicationId: string, slug: string) {
    return prisma.series.findFirst({
      where: { publicationId, slug },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        articles: {
          orderBy: { orderIndex: 'asc' },
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImageUrl: true,
                status: true,
                visibility: true,
                readingTime: true,
                publishedAt: true,
              },
            },
          },
        },
      },
    });
  },

  findMany(publicationId: string) {
    return prisma.series.findMany({
      where: { publicationId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { articles: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  update(
    id: string,
    data: { title?: string; description?: string | null; coverImageUrl?: string | null },
  ) {
    return prisma.series.update({ where: { id }, data });
  },

  slugExists(publicationId: string, slug: string) {
    return prisma.series.count({ where: { publicationId, slug } });
  },

  addArticle(seriesId: string, articleId: string, orderIndex: number) {
    return prisma.seriesArticle.upsert({
      where: { seriesId_articleId: { seriesId, articleId } },
      create: { seriesId, articleId, orderIndex },
      update: { orderIndex },
    });
  },

  removeArticle(seriesId: string, articleId: string) {
    return prisma.seriesArticle.delete({
      where: { seriesId_articleId: { seriesId, articleId } },
    });
  },

  // Reorder: update orderIndex for each article in the series
  reorderArticles(seriesId: string, orderedArticleIds: string[]) {
    return prisma.$transaction(
      orderedArticleIds.map((articleId, index) =>
        prisma.seriesArticle.update({
          where: { seriesId_articleId: { seriesId, articleId } },
          data: { orderIndex: index },
        }),
      ),
    );
  },
};
