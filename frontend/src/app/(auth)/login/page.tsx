'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await login(values.email, values.password);
      router.push(next);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string; message?: string } } };
      const code = apiErr?.response?.data?.error;
      if (code === 'INVALID_CREDENTIALS') {
        setError('root', { message: 'Email atau password salah.' });
      } else {
        setError('root', {
          message: apiErr?.response?.data?.message ?? 'Login gagal, coba lagi.',
        });
      }
    }
  }

  return (
    <AuthShell
      title="Selamat datang kembali"
      subtitle="Masuk untuk lanjut membaca dari titik terakhir kamu."
    >
      {/* Google placeholder */}
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#d4cdc4] bg-white px-4 py-2.5 text-sm font-medium text-[#2a261f] opacity-60 cursor-not-allowed"
      >
        <GoogleIcon />
        Lanjutkan dengan Google
      </button>

      <Divider />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-[#7a7060]">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            className="w-full rounded-lg border border-[#d4cdc4] bg-white px-3.5 py-2.5 text-sm text-[#2a261f] outline-none transition focus:border-[#2a261f] focus:ring-2 focus:ring-[#2a261f]/10"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label className="text-xs font-medium uppercase tracking-widest text-[#7a7060]">
              Kata sandi
            </label>
            <Link href="/forgot-password" className="text-[12.5px] text-[#7a7060] hover:text-[#2a261f]">
              Lupa sandi?
            </Link>
          </div>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-[#d4cdc4] bg-white px-3.5 py-2.5 text-sm text-[#2a261f] outline-none transition focus:border-[#2a261f] focus:ring-2 focus:ring-[#2a261f]/10"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <label className="mt-0.5 flex items-center gap-2 text-[13.5px] text-[#5a5348]">
          <input
            {...register('remember')}
            type="checkbox"
            className="h-3.5 w-3.5 accent-[#2a261f]"
          />
          Tetap masuk di perangkat ini
        </label>

        {errors.root && (
          <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1.5 w-full rounded-lg bg-[#2a261f] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a1710] disabled:opacity-60"
        >
          {isSubmitting ? 'Masuk…' : 'Masuk'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#7a7060]">
        Belum punya akun?{' '}
        <Link href="/register" className="text-[#2a261f] font-medium hover:underline">
          Daftar gratis
        </Link>
      </p>
    </AuthShell>
  );
}

// ——— Shared auth layout shell ———

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-screen grid-cols-2 overflow-hidden">
      {/* Left — brand panel */}
      <div className="flex flex-col border-r border-[#e8e2d9] bg-[#f9f7f4] px-14 py-12">
        <div className="mb-auto">
          <span className="font-serif text-xl font-semibold tracking-tight text-[#2a261f]">Lentera</span>
        </div>
        <div className="max-w-[380px]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a7060]">
            Catatan dari penulis
          </p>
          <blockquote className="font-serif text-[27px] font-medium italic leading-[1.35] text-[#2a261f]">
            &ldquo;Kami tidak menulis untuk mengalahkan algoritma. Kami menulis untuk dibaca dengan teliti oleh seseorang yang juga sedang minum kopi.&rdquo;
          </blockquote>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#d4cdc4]" />
            <div>
              <p className="text-sm font-semibold text-[#2a261f]">Andi Pratama</p>
              <p className="text-[13px] text-[#7a7060]">Co-founder · TechBites</p>
            </div>
          </div>
        </div>
        <p className="mt-auto pt-8 text-[12.5px] text-[#7a7060]">© 2026 Lentera · Esai mingguan</p>
      </div>

      {/* Right — form */}
      <div className="flex flex-col overflow-auto px-16 py-16">
        <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center">
          <h1 className="mb-2 font-serif text-3xl font-medium tracking-tight text-[#2a261f]">{title}</h1>
          {subtitle && <p className="mb-7 text-[15px] leading-relaxed text-[#5a5348]">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3.5 text-[12.5px] text-[#7a7060]">
      <div className="h-px flex-1 bg-[#e8e2d9]" />
      <span>atau</span>
      <div className="h-px flex-1 bg-[#e8e2d9]" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
