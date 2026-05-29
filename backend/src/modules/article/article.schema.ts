import { z } from 'zod';

export const createArticleSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(500),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  excerpt: z.string().max(500).nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  visibility: z.enum(['free', 'members_only']).optional(),
  slug: z.string().min(1).max(500).optional(),
  metaTitle: z.string().max(255).nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  seriesId: z.string().nullable().optional(),
});

export const publishArticleSchema = z.object({
  scheduledAt: z.string().datetime().nullable().optional(),
});

export const articleFiltersSchema = z.object({
  status: z.enum(['draft', 'scheduled', 'published']).optional(),
  authorId: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  q: z.string().optional(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type PublishArticleInput = z.infer<typeof publishArticleSchema>;
export type ArticleFilters = z.infer<typeof articleFiltersSchema>;
