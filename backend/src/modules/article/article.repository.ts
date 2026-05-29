import { prisma } from '../../config/database.config';
import type { ArticleFilters } from './article.schema';
import type { Prisma } from '@prisma/client';

export interface PublicArticleFilters {
  authorId?: string;
  tag?: string;
  cursor?: string;
  limit: number;
}

const PUBLIC_ARTICLE_SELECT = {
  id: true,
  publicationId: true,
  authorId: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImageUrl: true,
  status: true,
  visibility: true,
  publishedAt: true,
  readingTime: true,
  viewsCount: true,
  likesCount: true,
  author: { select: { id: true, name: true, avatarUrl: true } },
  tags: { include: { tag: true } },
} as const;

export const articleRepository = {
  create(data: { publicationId: string; authorId: string; title: string; slug: string }) {
    return prisma.article.create({ data });
  },

  findById(publicationId: string, id: string) {
    return prisma.article.findFirst({ where: { id, publicationId, deletedAt: null } });
  },

  findBySlug(publicationId: string, slug: string) {
    return prisma.article.findFirst({
      where: { publicationId, slug, deletedAt: null },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, bio: true } },
        tags: { include: { tag: true } },
        seriesLinks: {
          include: { series: { select: { id: true, title: true, slug: true } } },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  },

  findMany(publicationId: string, filters: ArticleFilters) {
    const where: Prisma.ArticleWhereInput = {
      publicationId,
      deletedAt: null,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.authorId ? { authorId: filters.authorId } : {}),
      ...(filters.q ? { title: { contains: filters.q, mode: 'insensitive' as const } } : {}),
    };

    return prisma.article.findMany({
      where,
      take: filters.limit + 1,
      ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        tags: { include: { tag: true } },
      },
    });
  },

  update(id: string, _publicationId: string, data: Prisma.ArticleUpdateInput) {
    return prisma.article.update({ where: { id }, data });
  },

  publish(id: string, publishedAt: Date) {
    return prisma.article.update({
      where: { id },
      data: { status: 'published', publishedAt, scheduledAt: null },
    });
  },

  schedule(id: string, scheduledAt: Date) {
    return prisma.article.update({
      where: { id },
      data: { status: 'scheduled', scheduledAt },
    });
  },

  softDelete(id: string, _publicationId: string) {
    return prisma.article.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  // Public list: published only, no content field, sorted by publishedAt
  findManyPublic(publicationId: string, filters: PublicArticleFilters) {
    const where: Prisma.ArticleWhereInput = {
      publicationId,
      status: 'published',
      deletedAt: null,
      ...(filters.authorId ? { authorId: filters.authorId } : {}),
      ...(filters.tag ? { tags: { some: { tag: { slug: filters.tag } } } } : {}),
    };
    return prisma.article.findMany({
      where,
      take: filters.limit + 1,
      ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
      orderBy: { publishedAt: 'desc' },
      select: PUBLIC_ARTICLE_SELECT,
    });
  },

  incrementViewCount(id: string) {
    return prisma.article.update({ where: { id }, data: { viewsCount: { increment: 1 } } });
  },

  findLike(articleId: string, userId: string) {
    return prisma.articleLike.findUnique({
      where: { articleId_userId: { articleId, userId } },
    });
  },

  addLike(articleId: string, userId: string) {
    return prisma.$transaction([
      prisma.articleLike.create({ data: { articleId, userId } }),
      prisma.article.update({ where: { id: articleId }, data: { likesCount: { increment: 1 } } }),
    ]);
  },

  removeLike(articleId: string, userId: string) {
    return prisma.$transaction([
      prisma.articleLike.delete({ where: { articleId_userId: { articleId, userId } } }),
      prisma.article.update({
        where: { id: articleId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
  },

  slugExists(publicationId: string, slug: string) {
    return prisma.article.count({ where: { publicationId, slug, deletedAt: null } });
  },

  upsertTag(publicationId: string, name: string) {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    return prisma.tag.upsert({
      where: { publicationId_slug: { publicationId, slug } },
      create: { publicationId, name, slug },
      update: {},
    });
  },

  syncTags(articleId: string, tagIds: string[]) {
    return prisma.$transaction([
      prisma.articleTag.deleteMany({ where: { articleId } }),
      prisma.articleTag.createMany({
        data: tagIds.map((tagId) => ({ articleId, tagId })),
      }),
    ]);
  },
};
