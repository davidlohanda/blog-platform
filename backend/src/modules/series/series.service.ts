import { randomUUID } from 'crypto';
import { seriesRepository } from './series.repository';
import { AppError } from '../../lib/AppError';
import type {
  CreateSeriesInput,
  UpdateSeriesInput,
  AddArticleToSeriesInput,
} from './series.schema';

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

async function uniqueSeriesSlug(publicationId: string, base: string): Promise<string> {
  const exists = await seriesRepository.slugExists(publicationId, base);
  if (!exists) return base;
  return `${base}-${randomUUID().slice(0, 6)}`;
}

export const seriesService = {
  async create(publicationId: string, authorId: string, input: CreateSeriesInput) {
    const base = toSlug(input.title) || `series-${Date.now()}`;
    const slug = await uniqueSeriesSlug(publicationId, base);
    return seriesRepository.create({
      publicationId,
      authorId,
      title: input.title,
      slug,
      description: input.description,
      coverImageUrl: input.coverImageUrl,
    });
  },

  async getById(publicationId: string, id: string) {
    const series = await seriesRepository.findById(publicationId, id);
    if (!series) throw AppError.notFound('Series tidak ditemukan');
    return series;
  },

  async getBySlug(publicationId: string, slug: string) {
    const series = await seriesRepository.findBySlug(publicationId, slug);
    if (!series) throw AppError.notFound('Series tidak ditemukan');
    return series;
  },

  async list(publicationId: string) {
    return seriesRepository.findMany(publicationId);
  },

  async update(publicationId: string, id: string, input: UpdateSeriesInput) {
    const series = await seriesRepository.findById(publicationId, id);
    if (!series) throw AppError.notFound('Series tidak ditemukan');
    return seriesRepository.update(publicationId, id, input);
  },

  async addArticle(publicationId: string, seriesId: string, input: AddArticleToSeriesInput) {
    const series = await seriesRepository.findById(publicationId, seriesId);
    if (!series) throw AppError.notFound('Series tidak ditemukan');
    const nextOrder = input.orderIndex ?? series.articles.length;
    return seriesRepository.addArticle(seriesId, input.articleId, nextOrder);
  },

  async removeArticle(publicationId: string, seriesId: string, articleId: string) {
    const series = await seriesRepository.findById(publicationId, seriesId);
    if (!series) throw AppError.notFound('Series tidak ditemukan');
    await seriesRepository.removeArticle(seriesId, articleId);
    return { message: 'Artikel berhasil dihapus dari series' };
  },

  async reorderArticles(publicationId: string, seriesId: string, orderedArticleIds: string[]) {
    const series = await seriesRepository.findById(publicationId, seriesId);
    if (!series) throw AppError.notFound('Series tidak ditemukan');
    await seriesRepository.reorderArticles(seriesId, orderedArticleIds);
    return seriesRepository.findById(publicationId, seriesId);
  },
};
