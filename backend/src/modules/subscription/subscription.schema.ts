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
  next: z.string().max(500).optional(),
});

export const webhookPayloadSchema = z.object({
  order_id: z.string().min(1, 'order_id wajib diisi'),
  status_code: z.string().min(1, 'status_code wajib diisi'),
  gross_amount: z
    .string()
    .min(1, 'gross_amount wajib diisi')
    .refine((v) => !isNaN(Number(v)), { message: 'gross_amount harus angka valid' }),
  signature_key: z.string().min(1, 'signature_key wajib diisi'),
  transaction_status: z.string().min(1, 'transaction_status wajib diisi'),
  payment_type: z.string().optional(),
  fraud_status: z.string().optional(),
});

export type UpdatePlansInput = z.infer<typeof updatePlansSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema> & { next?: string };
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
