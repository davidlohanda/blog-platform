import { z } from 'zod';

export const createSeriesSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(500),
  description: z.string().max(1000).nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
});

export const updateSeriesSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(1000).nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
});

export const addArticleToSeriesSchema = z.object({
  articleId: z.string().min(1, 'Article ID wajib diisi'),
  orderIndex: z.number().int().min(0).optional(),
});

export type CreateSeriesInput = z.infer<typeof createSeriesSchema>;
export type UpdateSeriesInput = z.infer<typeof updateSeriesSchema>;
export type AddArticleToSeriesInput = z.infer<typeof addArticleToSeriesSchema>;
