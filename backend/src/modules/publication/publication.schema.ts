import { z } from 'zod';

export const createPublicationSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(255),
  description: z.string().max(160, 'Deskripsi maksimal 160 karakter').optional(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung')
    .optional(),
});

export const updatePublicationSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(255).optional(),
  description: z.string().max(160).nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
});

export const setCustomDomainSchema = z.object({
  domain: z
    .string()
    .min(4, 'Domain tidak valid')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Format domain tidak valid'),
});

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;
export type SetCustomDomainInput = z.infer<typeof setCustomDomainSchema>;
