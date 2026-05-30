import { randomUUID } from 'crypto';
import { articleRepository } from './article.repository';
import { publicationRepository } from '../publication/publication.repository';
import { emailService } from '../email/email.service';
import { AppError } from '../../lib/AppError';
import type { Prisma } from '@prisma/client';
import type {
  CreateArticleInput,
  UpdateArticleInput,
  PublishArticleInput,
  ArticleFilters,
} from './article.schema';
import type { PublicArticleFilters } from './article.repository';

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 500);
}

async function uniqueArticleSlug(publicationId: string, base: string): Promise<string> {
  const exists = await articleRepository.slugExists(publicationId, base);
  if (!exists) return base;
  return `${base}-${randomUUID().slice(0, 6)}`;
}

function extractText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as { text?: string; content?: unknown[] };
  if (n.text) return n.text + ' ';
  if (Array.isArray(n.content)) return n.content.map(extractText).join('');
  return '';
}

function calcReadingTime(content: unknown): number {
  if (!content) return 1;
  const text = extractText(content);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const articleService = {
  async create(publicationId: string, authorId: string, input: CreateArticleInput) {
    const pub = await publicationRepository.findById(publicationId);
    if (!pub) throw AppError.notFound('Publication tidak ditemukan');

    const baseSlug = toSlug(input.title) || `artikel-${Date.now()}`;
    const slug = await uniqueArticleSlug(publicationId, baseSlug);

    return articleRepository.create({ publicationId, authorId, title: input.title, slug });
  },

  async getBySlug(publicationId: string, slug: string) {
    const article = await articleRepository.findBySlug(publicationId, slug);
    if (!article) throw AppError.notFound('Artikel tidak ditemukan');
    return article;
  },

  // Public reader: gates premium content based on membership
  async getPublicBySlug(
    publicationId: string,
    slug: string,
    opts: { isMember: boolean } = { isMember: false },
  ) {
    const article = await articleRepository.findBySlug(publicationId, slug);
    if (!article || article.status !== 'published') {
      throw AppError.notFound('Artikel tidak ditemukan');
    }

    if (article.visibility === 'members_only' && !opts.isMember) {
      // Return metadata + excerpt only — no content
      return { ...article, content: null };
    }

    return article;
  },

  async listPublic(publicationId: string, filters: PublicArticleFilters) {
    const items = await articleRepository.findManyPublic(publicationId, filters);
    const hasMore = items.length > filters.limit;
    const data = hasMore ? items.slice(0, filters.limit) : items;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;
    return { data, nextCursor, hasMore };
  },

  async incrementView(publicationId: string, id: string) {
    const article = await articleRepository.findById(publicationId, id);
    if (!article) throw AppError.notFound('Artikel tidak ditemukan');
    await articleRepository.incrementViewCount(id);
  },

  async toggleLike(publicationId: string, articleId: string, userId: string) {
    const article = await articleRepository.findById(publicationId, articleId);
    if (!article) throw AppError.notFound('Artikel tidak ditemukan');

    const existing = await articleRepository.findLike(articleId, userId);
    if (existing) {
      await articleRepository.removeLike(articleId, userId);
      return { liked: false, likesCount: Math.max(0, article.likesCount - 1) };
    }
    await articleRepository.addLike(articleId, userId);
    return { liked: true, likesCount: article.likesCount + 1 };
  },

  async getLikeStatus(publicationId: string, articleId: string, userId: string) {
    const article = await articleRepository.findById(publicationId, articleId);
    if (!article) throw AppError.notFound('Artikel tidak ditemukan');
    const like = await articleRepository.findLike(articleId, userId);
    return { liked: !!like, likesCount: article.likesCount };
  },

  async getById(publicationId: string, id: string) {
    const article = await articleRepository.findById(publicationId, id);
    if (!article) throw AppError.notFound('Artikel tidak ditemukan');
    return article;
  },

  async list(publicationId: string, filters: ArticleFilters) {
    const items = await articleRepository.findMany(publicationId, filters);
    const hasMore = items.length > filters.limit;
    const data = hasMore ? items.slice(0, filters.limit) : items;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;
    return { data, nextCursor, hasMore };
  },

  async update(publicationId: string, id: string, input: UpdateArticleInput) {
    const article = await articleRepository.findById(publicationId, id);
    if (!article) throw AppError.notFound('Artikel tidak ditemukan');

    const { tags, ...rest } = input;
    const readingTime = rest.content ? calcReadingTime(rest.content) : undefined;

    const slug = rest.slug;
    if (slug && slug !== article.slug) {
      const exists = await articleRepository.slugExists(publicationId, slug);
      if (exists) throw AppError.conflict('Slug sudah digunakan', 'SLUG_TAKEN');
    }

    const updated = await articleRepository.update(id, publicationId, {
      ...rest,
      ...(rest.content ? { content: rest.content as Prisma.InputJsonValue } : {}),
      ...(readingTime ? { readingTime } : {}),
      ...(slug ? { slug } : {}),
    } as Prisma.ArticleUpdateInput);

    if (tags) {
      const tagDocs = await Promise.all(
        tags.map((name) => articleRepository.upsertTag(publicationId, name)),
      );
      await articleRepository.syncTags(
        id,
        tagDocs.map((t) => t.id),
      );
    }

    return updated;
  },

  async publish(publicationId: string, id: string, input: PublishArticleInput) {
    const article = await articleRepository.findById(publicationId, id);
    if (!article) throw AppError.notFound('Artikel tidak ditemukan');

    if (input.scheduledAt) {
      const scheduledDate = new Date(input.scheduledAt);
      if (scheduledDate <= new Date()) {
        throw AppError.badRequest('Waktu jadwal harus di masa depan', 'INVALID_SCHEDULE');
      }
      return articleRepository.schedule(id, publicationId, scheduledDate);
    }

    const published = await articleRepository.publish(id, publicationId, new Date());

    // Notify subscribers (fire-and-forget — don't block the response)
    const pub = await publicationRepository.findById(publicationId);
    if (pub) {
      emailService
        .enqueueNewArticleNotifications(publicationId, pub.name, {
          title: article.title,
          excerpt: article.excerpt,
          slug: article.slug,
          coverImageUrl: article.coverImageUrl,
        })
        .catch((err: Error) =>
          console.error('[Email] Failed to enqueue article notifications:', err.message),
        );
    }

    return published;
  },

  async softDelete(publicationId: string, id: string) {
    const article = await articleRepository.findById(publicationId, id);
    if (!article) throw AppError.notFound('Artikel tidak ditemukan');
    return articleRepository.softDelete(id, publicationId);
  },

  async updateReadProgress(
    publicationId: string,
    articleId: string,
    userId: string,
    completionPercent: number,
  ) {
    const article = await articleRepository.findById(publicationId, articleId);
    if (!article) throw AppError.notFound('Artikel tidak ditemukan');
    const pct = Math.max(0, Math.min(100, Math.round(completionPercent)));
    return articleRepository.upsertReadProgress(articleId, userId, pct);
  },
};
