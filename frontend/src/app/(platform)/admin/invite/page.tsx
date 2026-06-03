'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminShell } from '@/components/layout/AdminShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { apiClient } from '@/lib/api/client';

const schema = z.object({
  ownerName: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  publicationName: z.string().min(2, 'Nama publication minimal 2 karakter').max(255),
});

type FormValues = z.infer<typeof schema>;

export default function AdminInvitePage() {
  const [success, setSuccess] = useState<{ email: string; publicationName: string } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    try {
      await apiClient.post('/admin/invite-owner', values);
      setSuccess({ email: values.email, publicationName: values.publicationName });
      form.reset();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string; message?: string } } };
      const code = apiErr?.response?.data?.error;
      if (code === 'EMAIL_TAKEN') {
        form.setError('email', { message: 'Email sudah terdaftar sebagai user Lentera' });
      } else {
        form.setError('root', {
          message: apiErr?.response?.data?.message ?? 'Gagal mengirim undangan',
        });
      }
    }
  }

  return (
    <AdminShell
      title="Invite Owner"
      subtitle="Undang calon owner untuk membuat publication baru di Lentera"
    >
      <div className="p-8">
        <div className="mx-auto max-w-lg">
          {success && (
            <div className="mb-6 rounded-lg border border-border bg-muted px-5 py-4">
              <p className="text-sm font-semibold text-foreground">Undangan terkirim!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Email undangan dikirim ke <strong>{success.email}</strong> untuk publication{' '}
                <strong>{success.publicationName}</strong>. Link berlaku 7 hari.
              </p>
              <button
                onClick={() => setSuccess(null)}
                className="mt-3 text-xs font-medium text-foreground hover:underline"
              >
                Invite owner lain →
              </button>
            </div>
          )}

          <Card className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama calon owner</FormLabel>
                      <FormControl>
                        <Input placeholder="Mis. Budi Santoso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="budi@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Email ini belum boleh terdaftar di Lentera.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publicationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Publication</FormLabel>
                      <FormControl>
                        <Input placeholder="Mis. Catatan Budi" {...field} />
                      </FormControl>
                      <FormDescription>
                        Publication akan dibuat dengan nama ini. Owner bisa mengubahnya nanti.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Mengirim undangan…' : 'Kirim Undangan'}
                </Button>
              </form>
            </Form>
          </Card>

          <div className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Cara kerja invite owner:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Sistem membuat publication draft dengan nama yang diisi</li>
              <li>Email undangan dikirim ke calon owner (link berlaku 7 hari)</li>
              <li>Calon owner klik link → langsung ke halaman register</li>
              <li>Setelah register, otomatis menjadi owner publication tersebut</li>
              <li>Tidak perlu verifikasi email — langsung masuk dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
