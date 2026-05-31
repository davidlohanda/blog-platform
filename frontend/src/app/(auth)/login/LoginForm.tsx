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
import { apiClient } from '@/lib/api/client';

const schema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { isSubmitting } = form.formState;

  async function resolveRedirect(role: string): Promise<string> {
    // Explicit next param (from proxy redirect) takes priority, except generic /dashboard default
    if (next && next !== '/dashboard' && next !== '/') return next;

    if (role === 'platform_admin') return '/admin/dashboard';

    // Check if user has any publications (owner/author)
    try {
      const { data } = await apiClient.get<{ data: Array<unknown> }>('/publications/mine');
      return (data.data as Array<unknown>).length > 0 ? '/dashboard' : '/';
    } catch {
      return '/dashboard';
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      const result = await login(values.email, values.password);
      const destination = await resolveRedirect(result.user.role);
      router.push(destination);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string; message?: string } } };
      const code = apiErr?.response?.data?.error;
      if (code === 'INVALID_CREDENTIALS') {
        form.setError('root', { message: 'Email atau password salah.' });
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
      subtitle="Masuk untuk lanjut membaca dari titik terakhir kamu."
      footer={
        <>
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            Daftar gratis
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full"
        type="button"
        onClick={() => {
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/google`;
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
