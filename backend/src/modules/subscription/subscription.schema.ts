import { z } from 'zod';

const planSchema = z.object({
  durationMonths: z
    .number()
    .int()
    .refine((v) => [1, 3, 6, 12].includes(v), {
      message: 'Durasi harus 1, 3, 6, atau 12 bulan',
    }),
  price: z.number().positive('Harga harus lebih dari 0'),
  isActive: z.boolean(),
});

// PUT replaces all plans at once
export const updatePlansSchema = z.object({
  plans: z.array(planSchema).min(1, 'Minimal 1 paket'),
});

export const createOrderSchema = z.object({
  planId: z.string().min(1, 'Plan ID wajib diisi'),
});

export type UpdatePlansInput = z.infer<typeof updatePlansSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
