'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';

// ─── Types ───────────────────────────────────────────────────────────────────

interface InviteData {
  email: string;
  ownerName: string;
  publicationId: string;
  publicationName: string;
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

const step1Schema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(255),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/(?=.*[a-zA-Z])(?=.*\d)/, 'Harus mengandung huruf dan angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

const step2Schema = z.object({
  publicationName: z.string().min(2, 'Nama minimal 2 karakter').max(255),
  publicationSlug: z
    .string()
    .min(2, 'Slug minimal 2 karakter')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Hanya huruf kecil, angka, dan tanda hubung'),
  publicationDescription: z.string().max(160, 'Maks 160 karakter').optional(),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

// ─── Helper ──────────────────────────────────────────────────────────────────

function toSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

// ─── Progress Indicator ───────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              i + 1 < current
                ? 'bg-foreground text-background'
                : i + 1 === current
                  ? 'border-2 border-foreground text-foreground'
                  : 'border border-border text-muted-foreground'
            }`}
          >
            {i + 1 < current ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < total - 1 && (
            <div
              className={`h-px w-8 ${i + 1 < current ? 'bg-foreground' : 'bg-border'}`}
            />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs text-muted-foreground">
        Langkah {current} dari {total}
      </span>
    </div>
  );
}

// ─── Step 1 — Buat akun ───────────────────────────────────────────────────────

function Step1({ invite, onNext }: { invite: InviteData; onNext: (v: Step1Values) => void }) {
  const form = useForm<Step1Values>({ resolver: zodResolver(step1Schema) });

  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Langkah 1
      </p>
      <h1 className="mb-1 font-serif text-3xl font-medium tracking-tight text-foreground">
        Buat akun kamu
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Kamu diundang untuk menjadi Owner publication. Akun ini akan terhubung ke email{' '}
        <span className="font-medium text-foreground">{invite.email}</span>.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama tampilan</FormLabel>
                <FormControl>
                  <Input placeholder="Mis. Budi Santoso" autoComplete="name" {...field} />
                </FormControl>
                <FormDescription>Muncul di profil dan artikel.</FormDescription>
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
                  <Input
                    type="password"
                    placeholder="Min. 8 karakter, huruf + angka"
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
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            Lanjut ke setup publication →
          </Button>
        </form>
      </Form>
    </div>
  );
}

// ─── Step 2 — Setup publication ───────────────────────────────────────────────

function Step2({
  invite,
  onNext,
  onBack,
  isSubmitting,
}: {
  invite: InviteData;
  onNext: (v: Step2Values) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      publicationName: invite.publicationName,
      publicationSlug: toSlug(invite.publicationName),
      publicationDescription: '',
    },
  });

  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugSuggestion, setSlugSuggestion] = useState<string | null>(null);
  const [descLen, setDescLen] = useState(0);

  // useWatch avoids the react-compiler warning about form.watch()
  const slugValue = useWatch({ control: form.control, name: 'publicationSlug' });
  const pubNameValue = useWatch({ control: form.control, name: 'publicationName' });

  const checkSlug = useCallback(async (slug: string) => {
    if (!slug || slug.length < 2) return;
    setSlugStatus('checking');
    setSlugSuggestion(null);
    try {
      const { data } = await apiClient.get<{
        data: { available: boolean; suggestion?: string };
      }>(`/publications/check-slug?slug=${encodeURIComponent(slug)}`);
      if (data.data.available) {
        setSlugStatus('available');
      } else {
        setSlugStatus('taken');
        setSlugSuggestion(data.data.suggestion ?? null);
      }
    } catch {
      setSlugStatus('idle');
    }
  }, []);

  // Debounce slug check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slugValue) checkSlug(slugValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [slugValue, checkSlug]);

  // Auto-generate slug from publication name (only if user hasn't edited it manually)
  const initialSlug = useRef(toSlug(invite.publicationName));
  useEffect(() => {
    const currentSlug = form.getValues('publicationSlug');
    if (currentSlug === initialSlug.current || currentSlug === '') {
      const next = toSlug(pubNameValue);
      form.setValue('publicationSlug', next, { shouldValidate: false });
      initialSlug.current = next;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pubNameValue]);

  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Langkah 2
      </p>
      <h1 className="mb-1 font-serif text-3xl font-medium tracking-tight text-foreground">
        Setup publication kamu
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Kamu akan menjadi Owner dari publication ini. Bisa diubah kapan saja.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
          <FormField
            control={form.control}
            name="publicationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama publication</FormLabel>
                <FormControl>
                  <Input placeholder="Mis. Investasi Cerdas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publicationSlug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="investasi-cerdas"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    }}
                  />
                </FormControl>
                {/* URL preview */}
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                      {field.value || 'slug'}.lentera.id
                    </span>
                  </span>
                  {slugStatus === 'checking' && (
                    <span className="text-muted-foreground">Mengecek…</span>
                  )}
                  {slugStatus === 'available' && (
                    <span className="font-medium text-green-600 dark:text-green-400">✓ Tersedia</span>
                  )}
                  {slugStatus === 'taken' && (
                    <span className="text-destructive">
                      Sudah digunakan.
                      {slugSuggestion && (
                        <>
                          {' '}
                          Coba{' '}
                          <button
                            type="button"
                            className="font-medium underline"
                            onClick={() => {
                              form.setValue('publicationSlug', slugSuggestion, {
                                shouldValidate: true,
                              });
                            }}
                          >
                            {slugSuggestion}
                          </button>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publicationDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Deskripsi singkat{' '}
                  <span className="font-normal text-muted-foreground">(opsional)</span>
                </FormLabel>
                <FormControl>
                  <textarea
                    className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[72px] w-full rounded-lg border px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    placeholder="Tentang apa publication ini?"
                    maxLength={160}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setDescLen(e.target.value.length);
                    }}
                  />
                </FormControl>
                <div className="flex justify-between">
                  <FormDescription>Muncul di halaman publication dan SEO.</FormDescription>
                  <span className="text-xs text-muted-foreground">{descLen} / 160</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
              ← Kembali
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting || slugStatus === 'taken'}>
              {isSubmitting ? 'Menyiapkan publication…' : 'Selesaikan setup →'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// ─── Step 3 — Sukses ─────────────────────────────────────────────────────────

function Step3({ publicationSlug }: { publicationSlug: string }) {

  return (
    <div className="text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M6 16l7 7L26 9"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <h1 className="mb-3 font-serif text-3xl font-medium tracking-tight text-foreground">
        Publication kamu sudah siap!
      </h1>
      <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
        Selamat datang di Lentera. Publication{' '}
        <span className="font-medium text-foreground">{publicationSlug}.lentera.id</span> sudah aktif
        dan siap diisi konten.
      </p>
      <p className="mb-8 text-sm text-muted-foreground">
        Dashboard kamu menampilkan checklist getting started — ikuti langkah-langkahnya untuk
        memaksimalkan publication pertamamu.
      </p>
      <Button
        className="w-full"
        onClick={() => {
          const isDev = process.env.NODE_ENV === 'development';
          const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'lentera.id';
          const baseUrl = isDev
            ? `http://${publicationSlug}.lvh.me:3000`
            : `https://${publicationSlug}.${rootDomain}`;
          window.location.assign(`${baseUrl}/admin/dashboard`);
        }}
      >
        Mulai kelola publication →
      </Button>
    </div>
  );
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

function AcceptOwnerInviteWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const token = searchParams.get('token');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null);
  const [publicationSlug, setPublicationSlug] = useState('');
  // Initialize error immediately if token is missing — avoids setState-in-effect
  const [error, setError] = useState<string>(() =>
    !token ? 'Token undangan tidak ditemukan.' : '',
  );
  const [loading, setLoading] = useState<boolean>(() => !!token);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return; // error already set in initial state
    apiClient
      .get<{ data: InviteData }>(`/auth/accept-owner-invite?token=${token}`)
      .then(({ data }) => {
        setInvite(data.data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const apiErr = err as { response?: { data?: { message?: string } } };
        setError(apiErr?.response?.data?.message ?? 'Token tidak valid atau sudah kedaluwarsa.');
        setLoading(false);
      });
  }, [token]);

  async function handleComplete(step2Values: Step2Values) {
    if (!step1Data || !token) return;
    setSubmitting(true);
    try {
      const { data } = await apiClient.post<{
        data: {
          accessToken: string;
          publicationSlug: string;
          user: { id: string; email: string; name: string; role: string; emailVerifiedAt: string };
        };
      }>('/auth/complete-owner-invite', {
        token,
        name: step1Data.name,
        password: step1Data.password,
        publicationName: step2Values.publicationName,
        publicationSlug: step2Values.publicationSlug,
        publicationDescription: step2Values.publicationDescription || undefined,
      });

      // Store access token
      setAuth(data.data.accessToken, {
        id: data.data.user.id,
        email: data.data.user.email,
        name: data.data.user.name,
        role: data.data.user.role,
        avatarUrl: null,
        emailVerifiedAt: data.data.user.emailVerifiedAt,
      });

      setPublicationSlug(data.data.publicationSlug);
      setStep(3);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr?.response?.data?.message ?? 'Gagal menyelesaikan setup. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Memvalidasi undangan…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <p className="mb-2 text-xl font-semibold text-foreground">Undangan tidak valid</p>
          <p className="mb-6 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => router.push('/')}>
            Kembali ke beranda
          </Button>
        </Card>
      </div>
    );
  }

  if (!invite) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Lentera brand */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
            <span className="font-serif text-sm font-semibold italic text-background">L</span>
          </div>
          <span className="font-serif text-lg font-medium text-foreground">Lentera</span>
        </div>

        {step < 3 && <StepIndicator current={step} total={3} />}

        {step === 1 && (
          <Step1
            invite={invite}
            onNext={(v) => {
              setStep1Data(v);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <Step2
            invite={invite}
            onNext={handleComplete}
            onBack={() => setStep(1)}
            isSubmitting={submitting}
          />
        )}
        {step === 3 && <Step3 publicationSlug={publicationSlug} />}

        {error && step === 2 && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Memuat…</p>
        </div>
      }
    >
      <AcceptOwnerInviteWizard />
    </Suspense>
  );
}
