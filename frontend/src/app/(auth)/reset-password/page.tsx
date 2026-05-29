'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { apiClient } from '@/lib/api/client';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Harus mengandung huruf dan angka'),
    confirm: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Password tidak cocok',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { isSubmitting } = form.formState;

  if (!token) {
    return (
      <AuthShell
        title="Link tidak valid"
        subtitle="Token reset password tidak ditemukan. Pastikan kamu mengklik link dari email dengan benar."
        footer={
          <Link href="/forgot-password" className="hover:text-foreground">
            Minta link reset baru
          </Link>
        }
      >
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Token tidak ditemukan di URL. Silakan minta link reset password baru.
        </div>
      </AuthShell>
    );
  }

  async function onSubmit(values: FormValues) {
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        password: values.password,
      });
      router.push('/login?reset=success');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string; message?: string } } };
      const code = apiErr?.response?.data?.error;
      if (code === 'INVALID_TOKEN') {
        form.setError('root', {
          message: 'Link sudah kedaluwarsa atau tidak valid. Silakan minta link baru.',
        });
      } else {
        form.setError('root', {
          message: apiErr?.response?.data?.message ?? 'Gagal mereset password, coba lagi.',
        });
      }
    }
  }

  return (
    <AuthShell
      title="Buat password baru"
      subtitle="Masukkan password baru kamu. Minimal 8 karakter dengan kombinasi huruf dan angka."
      footer={
        <Link href="/login" className="hover:text-foreground">
          ← Kembali ke halaman masuk
        </Link>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password baru</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ulangi password baru</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button type="submit" className="mt-1.5 w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan…' : 'Simpan password baru'}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
