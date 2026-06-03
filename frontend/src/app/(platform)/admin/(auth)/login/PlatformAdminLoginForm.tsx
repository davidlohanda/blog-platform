'use client';

import { useRouter } from 'next/navigation';
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
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type FormValues = z.infer<typeof schema>;

export function PlatformAdminLoginForm() {
  const { adminLogin } = useAuth();
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    try {
      await adminLogin(values.email, values.password);
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string; message?: string } } };
      const code = apiErr?.response?.data?.error;
      if (code === 'INVALID_CREDENTIALS') {
        form.setError('root', { message: 'Email atau password salah.' });
      } else if (code === 'NOT_PLATFORM_ADMIN') {
        form.setError('root', { message: 'Akun ini bukan admin platform.' });
      } else if (code === 'LOGIN_LOCKED') {
        form.setError('root', { message: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' });
      } else {
        form.setError('root', {
          message: apiErr?.response?.data?.message ?? 'Login gagal, coba lagi.',
        });
      }
    }
  }

  return (
    <AuthShell title="Platform Admin" subtitle="Masuk dengan akun admin platform Lentera.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="admin@lentera.id"
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
