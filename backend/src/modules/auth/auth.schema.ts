import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(255),
  email: z.email('Format email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Password harus mengandung huruf dan angka'),
  ownerInviteToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const verifyEmailQuerySchema = z.object({
  token: z.string().min(1, 'Token wajib diisi'),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Format email tidak valid'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token wajib diisi'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Password harus mengandung huruf dan angka'),
});

export const completeOwnerInviteSchema = z.object({
  token: z.string().min(1, 'Token wajib diisi'),
  name: z.string().min(2, 'Nama minimal 2 karakter').max(255),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Password harus mengandung huruf dan angka'),
  publicationName: z.string().min(2, 'Nama publication minimal 2 karakter').max(255),
  publicationSlug: z
    .string()
    .min(2, 'Slug minimal 2 karakter')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  publicationDescription: z.string().max(160).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema> & { ownerInviteToken?: string };
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
