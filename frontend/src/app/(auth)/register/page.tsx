'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api/client';

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Harus mengandung huruf dan angka'),
  tos: z.literal(true, { message: 'Kamu harus menyetujui ketentuan' }),
});

type FormValues = z.infer<typeof schema>;

function RegisterForm() {
  const { register: registerUser, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const inviteToken = searchParams.get('invite');
  const inviteEmail = searchParams.get('email') ?? '';
  const isOwnerInvite = !!inviteToken;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: inviteEmail },
  });
  const { isSubmitting } = form.formState;

  // Sync email field jika ada invite email dari URL
  useEffect(() => {
    if (inviteEmail) {
      form.setValue('email', inviteEmail);
    }
  }, [inviteEmail, form]);

  async function onSubmit(values: FormValues) {
    try {
      if (isOwnerInvite) {
        // Register dengan owner invite — langsung login setelahnya
        const { data } = await apiClient.post<{
          data: { user: { email: string } };
        }>('/auth/register', {
          name: values.name,
          email: values.email,
          password: values.password,
          ownerInviteToken: inviteToken,
        });

        // Auto-login setelah register dengan invite (email sudah verified)
        await login(data.data.user.email, values.password);
        router.push('/dashboard');
        return;
      }

      // Register normal
      const result = await registerUser(values.name, values.email, values.password);
      setRegisteredEmail(result.user.email);
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string; message?: string } } };
      const code = apiErr?.response?.data?.error;
      if (code === 'EMAIL_TAKEN') {
        form.setError('email', { message: 'Email sudah terdaftar' });
      } else {
        form.setError('root', {
          message: apiErr?.response?.data?.message ?? 'Pendaftaran gagal',
        });
      }
    }
  }

  if (success) {
    return (
      <AuthShell
        title="Cek inbox kamu"
        subtitle={`Kami sudah kirim link verifikasi ke ${registeredEmail}. Klik link tersebut untuk mengaktifkan akun kamu.`}
        footer={
          <>
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Masuk
            </Link>
          </>
        }
      >
        <div className="rounded-lg border border-border bg-muted px-4 py-3.5 text-sm text-muted-foreground">
          Tidak menerima email? Tunggu 1–2 menit, lalu cek folder spam.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={isOwnerInvite ? 'Buat akun owner' : 'Buat akun Lentera'}
      subtitle={
        isOwnerInvite
          ? 'Kamu diundang sebagai owner publication di Lentera. Buat akun untuk mulai.'
          : 'Gratis untuk membaca artikel free dan menyimpan ke library kamu sendiri.'
      }
      footer={
        <>
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      {!isOwnerInvite && (
        <>
          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/google`;
            }}
          >
            <GoogleIcon />
            Daftar dengan Google
          </Button>

          <Divider />
        </>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    readOnly={isOwnerInvite}
                    className={isOwnerInvite ? 'bg-muted text-muted-foreground' : ''}
                    {...field}
                  />
                </FormControl>
                {isOwnerInvite && (
                  <FormDescription>Email ini sudah ditentukan oleh undangan.</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kata sandi</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Minimal 8 karakter" {...field} />
                </FormControl>
                <FormDescription>Kombinasi huruf dan angka lebih disarankan.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tos"
            render={({ field }) => (
              <FormItem className="flex items-start gap-2 space-y-0 pt-1">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked || undefined)}
                    className="mt-0.5 shrink-0"
                  />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel className="text-sm font-normal leading-relaxed text-muted-foreground">
                    Saya menyetujui{' '}
                    <Link href="/terms" className="text-foreground hover:underline">
                      Ketentuan
                    </Link>{' '}
                    dan{' '}
                    <Link href="/privacy" className="text-foreground hover:underline">
                      Kebijakan Privasi
                    </Link>{' '}
                    Lentera.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting
              ? isOwnerInvite ? 'Membuat akun…' : 'Membuat akun…'
              : isOwnerInvite ? 'Buat akun & mulai' : 'Buat akun'}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
