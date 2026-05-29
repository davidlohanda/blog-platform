import { prisma } from '../../config/database.config';
import type { ArticleFilters } from './article.schema';
import type { Prisma } from '@prisma/client';

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
