'use client';

import { useState } from 'react';
import Link from 'next/link';
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

const schema = z.object({
  email: z.email('Format email tidak valid'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    try {
      await apiClient.post('/auth/forgot-password', { email: values.email });
      setSentEmail(values.email);
      setSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setSentEmail(values.email);
      setSent(true);
    }
  }

  return (
    <AuthShell
      title={sent ? 'Cek inbox kamu' : 'Lupa kata sandi'}
      subtitle={
        sent
          ? `Kami sudah kirim tautan reset ke ${sentEmail}. Tautan berlaku selama 1 jam.`
          : 'Masukkan email kamu, kami akan kirim tautan untuk membuat kata sandi baru.'
      }
      footer={
        <Link href="/login" className="inline-flex items-center gap-1.5 hover:text-foreground">
          ← Kembali ke halaman masuk
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-xl border border-border bg-muted p-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2.5 8l4 4 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-foreground"
                />
              </svg>
            </div>
            <div className="text-sm leading-relaxed">
              <p className="mb-1 font-semibold text-foreground">Email terkirim</p>
              <p className="text-muted-foreground">
                Tidak menerima? Tunggu 1–2 menit, lalu cek folder spam.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full"
            type="button"
            onClick={() => setSent(false)}
          >
            Kirim ulang tautan
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email terdaftar</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="nama@email.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="mt-1.5 w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Mengirim…' : 'Kirim tautan reset'}
            </Button>
          </form>
        </Form>
      )}
    </AuthShell>
  );
}
