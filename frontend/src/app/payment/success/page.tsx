'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';

interface Subscription {
  id: string;
  status: string;
  startedAt: string | null;
  expiresAt: string | null;
  plan: { durationMonths: number; price: number };
  publication: { name: string; slug: string };
}

function formatDate(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{ data: Subscription[] }>('/subscriptions/me')
      .then(({ data }) => {
        if (cancelled) return;
        // Ambil subscription active terbaru
        const active = data.data.find((s) => s.status === 'active') ?? data.data[0] ?? null;
        setSubscription(active);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const articleHref = next ? `/${next}` : '/';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        {/* Icon sukses */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-foreground/10">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-foreground"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="mb-2 font-serif text-3xl font-medium tracking-tight text-foreground">
            Pembayaran berhasil!
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Subscription kamu sudah aktif. Selamat menikmati semua konten premium.
          </p>
        </div>

        {/* Subscription info */}
        {!loading && subscription && (
          <Card className="mb-6 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Detail Subscription
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Publication</span>
                <span className="font-medium text-foreground">{subscription.publication.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paket</span>
                <span className="font-medium text-foreground">
                  {subscription.plan.durationMonths} bulan
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aktif hingga</span>
                <span className="font-medium text-foreground">
                  {formatDate(subscription.expiresAt)}
                </span>
              </div>
            </div>
          </Card>
        )}

        {loading && (
          <Card className="mb-6 h-24 animate-pulse bg-muted p-5" />
        )}

        {/* CTA */}
        <div className="flex flex-col gap-3">
          {next ? (
            <Link
              href={articleHref}
              className={cn(buttonVariants(), 'w-full gap-2')}
            >
              Baca artikel sekarang
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          ) : (
            <Link href="/" className={cn(buttonVariants(), 'w-full')}>
              Jelajahi konten
            </Link>
          )}
          <Link
            href="/me/subscription"
            className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Lihat detail subscription →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Memuat…
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
