'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell } from '@/components/layout/AuthShell';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { Divider } from '@/components/ui/Divider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { usePublicationContext } from '@/contexts/PublicationContext';

const schema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { login } = useAuth();
  const { publication } = usePublicationContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    try {
      await login(values.email, values.password);
      router.push('/');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string; message?: string } } };
      const code = apiErr?.response?.data?.error;
      if (code === 'INVALID_CREDENTIALS') {
        form.setError('root', { message: 'Email atau password salah.' });
      } else if (code === 'EMAIL_NOT_VERIFIED') {
        form.setError('root', {
          message: 'Email belum diverifikasi. Cek inbox dan folder spam kamu.',
        });
      } else if (code === 'LOGIN_LOCKED') {
        form.setError('root', {
          message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
        });
      } else {
        form.setError('root', {
          message: apiErr?.response?.data?.message ?? 'Login gagal, coba lagi.',
        });
      }
    }
  }

  return (
    <AuthShell
      title="Selamat datang kembali"
      subtitle={
        publication?.name
          ? `Masuk untuk melanjutkan membaca ${publication.name}.`
          : 'Masuk untuk lanjut membaca dari titik terakhir kamu.'
      }
      footer={
        <>
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            Daftar gratis
          </Link>
        </>
      }
    >
      {errorParam === 'use_password' && (
        <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          Akun ini terdaftar dengan email dan password. Silakan login menggunakan form di bawah.
        </p>
      )}

      <Button
        variant="outline"
        className="w-full"
        type="button"
        onClick={() => {
          const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
          const pubId = publication?.id ?? '';
          const url = pubId ? `${api}/auth/google?pub_id=${encodeURIComponent(pubId)}` : `${api}/auth/google`;
          window.location.href = url;
        }}
      >
        <GoogleIcon />
        Lanjutkan dengan Google
      </Button>

      <Divider />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-baseline justify-between">
                  <FormLabel>Kata sandi</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Lupa sandi?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal text-muted-foreground">
                  Tetap masuk di perangkat ini
                </FormLabel>
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Masuk…' : 'Masuk'}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
