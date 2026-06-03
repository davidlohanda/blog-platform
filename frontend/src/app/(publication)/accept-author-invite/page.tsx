'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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

interface InviteMetadata {
  email: string;
  publicationId: string;
  publicationName: string;
  publicationSlug: string;
  role: string;
  isExistingUser: boolean;
}

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Harus mengandung huruf dan angka'),
});

type FormValues = z.infer<typeof schema>;

function AcceptAuthorInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [metadata, setMetadata] = useState<InviteMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!token);
  const [error, setError] = useState<string>(() =>
    !token ? 'Token undangan tidak ditemukan.' : '',
  );
  const [accepting, setAccepting] = useState(false);

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!token) return;
    apiClient
      .get<{ data: InviteMetadata }>(`/auth/author-invite?token=${encodeURIComponent(token)}`)
      .then(({ data }) => setMetadata(data.data))
      .catch(() => setError('Undangan tidak valid atau sudah kedaluwarsa.'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAcceptExisting() {
    if (!token) return;
    setAccepting(true);
    try {
      const { data } = await apiClient.post<{ data: { accessToken: string; publicationSlug: string } }>(
        '/auth/complete-author-invite',
        { token },
      );
      const isDev = process.env.NODE_ENV === 'development';
      const baseUrl = isDev
        ? `http://${data.data.publicationSlug}.lvh.me:3000`
        : `https://${data.data.publicationSlug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'lentera.id'}`;
      window.location.assign(`${baseUrl}/admin/dashboard`);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr?.response?.data?.message ?? 'Gagal menerima undangan.');
      setAccepting(false);
    }
  }

  async function handleNewUser(values: FormValues) {
    if (!token) return;
    setAccepting(true);
    try {
      const { data } = await apiClient.post<{ data: { accessToken: string; publicationSlug: string } }>(
        '/auth/complete-author-invite',
        { token, name: values.name, password: values.password },
      );
      const isDev = process.env.NODE_ENV === 'development';
      const baseUrl = isDev
        ? `http://${data.data.publicationSlug}.lvh.me:3000`
        : `https://${data.data.publicationSlug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'lentera.id'}`;
      window.location.assign(`${baseUrl}/admin/dashboard`);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr?.response?.data?.message ?? 'Gagal membuat akun.');
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Memuat undangan…
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <AuthShell title="Undangan Tidak Valid" subtitle={error || 'Terjadi kesalahan.'}>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error || 'Undangan tidak valid atau sudah kedaluwarsa.'}
        </div>
      </AuthShell>
    );
  }

  if (metadata.isExistingUser) {
    return (
      <AuthShell
        title="Undangan Author"
        subtitle={`Kamu diundang bergabung ke ${metadata.publicationName} sebagai ${metadata.role}.`}
      >
        <div className="rounded-xl border border-border bg-muted p-5 text-sm text-muted-foreground">
          <p>
            Email: <strong className="text-foreground">{metadata.email}</strong>
          </p>
          <p className="mt-1">
            Publication: <strong className="text-foreground">{metadata.publicationName}</strong>
          </p>
        </div>
        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>
        )}
        <Button className="w-full" onClick={handleAcceptExisting} disabled={accepting}>
          {accepting ? 'Memproses…' : 'Terima undangan'}
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Buat Akun Author"
      subtitle={`Kamu diundang bergabung ke ${metadata.publicationName}. Buat akun untuk mulai.`}
    >
      <div className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
        <p>
          Email: <strong className="text-foreground">{metadata.email}</strong>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleNewUser)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Mis. Rina Astari" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Minimal 8 karakter" {...field} />
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
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={accepting || form.formState.isSubmitting}>
            {accepting || form.formState.isSubmitting ? 'Membuat akun…' : 'Buat akun & bergabung'}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}

export default function AcceptAuthorInvitePage() {
  return (
    <Suspense>
      <AcceptAuthorInviteContent />
    </Suspense>
  );
}
