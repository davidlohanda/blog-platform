'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';

interface Plan {
  id: string;
  durationMonths: number;
  price: number;
  total: number;
  savingsPercent: number;
}

interface SnapResult {
  order_id?: string;
}

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        opts: {
          onSuccess?: (r: SnapResult) => void;
          onPending?: (r: SnapResult) => void;
          onError?: (r: SnapResult) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

const fmtRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
const SNAP_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';

function SubscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pubId = searchParams.get('pub') ?? '';
  const next = searchParams.get('next') ?? '';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(!!pubId);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  // Load Midtrans Snap.js once
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '';
    if (document.querySelector(`script[src="${SNAP_URL}"]`)) return;
    const script = document.createElement('script');
    script.src = SNAP_URL;
    script.setAttribute('data-client-key', clientKey);
    document.body.appendChild(script);
  }, []);

  // Fetch plans (only runs when pubId present; no-pubId is handled as derived error below)
  useEffect(() => {
    if (!pubId) return;
    let cancelled = false;
    apiClient
      .get<{ data: Plan[] }>(`/publications/${pubId}/subscription-plans`)
      .then(({ data }) => {
        if (cancelled) return;
        setPlans(data.data);
        // default to best-value (highest savings) plan
        const best = [...data.data].sort((a, b) => b.savingsPercent - a.savingsPercent)[0];
        if (best) setSelected(best.id);
      })
      .catch(() => { if (!cancelled) setError('Gagal memuat paket.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pubId]);

  const noPubError = !pubId ? 'Publication tidak ditentukan (tambahkan ?pub=<id> di URL).' : '';

  const plan = plans.find((p) => p.id === selected);

  const handlePay = useCallback(async () => {
    if (!plan || !pubId) return;
    setPaying(true);
    setError('');
    try {
      const { data } = await apiClient.post<{ data: { snapToken: string } }>(
        `/publications/${pubId}/subscriptions/order`,
        { planId: plan.id, next: next || undefined },
      );
      const token = data.data.snapToken;
      if (!window.snap) {
        setError('Pembayaran belum siap, muat ulang halaman.');
        setPaying(false);
        return;
      }
      const successUrl = next
        ? `/payment/success?next=${encodeURIComponent(next)}`
        : '/payment/success';
      window.snap.pay(token, {
        onSuccess: () => router.push(successUrl),
        onPending: () => router.push('/me/subscription'),
        onError: () => { setError('Pembayaran gagal. Coba lagi.'); setPaying(false); },
        onClose: () => setPaying(false),
      });
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string; message?: string } } };
      if (apiErr?.response?.data?.error === 'ALREADY_SUBSCRIBED') {
        setError('Kamu sudah punya subscription aktif untuk publication ini.');
      } else {
        setError(apiErr?.response?.data?.message ?? 'Gagal membuat order.');
      }
      setPaying(false);
    }
  }, [plan, pubId, next, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Memuat paket…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-8 max-w-xl">
          <h1 className="mb-3 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Berlangganan
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Pilih durasi yang paling cocok. Kamu bisa berhenti kapan saja.
          </p>
        </div>

        {(error || noPubError) && (
          <div className="mb-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error || noPubError}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-start">
          {/* Plan selection */}
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pilih paket
            </p>
            <div className="space-y-3">
              {plans.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Publication ini belum mengatur paket subscription.
                </p>
              )}
              {plans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p.id)}
                  className={`w-full rounded-xl border p-5 text-left transition-colors ${
                    selected === p.id ? 'border-foreground border-2' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          selected === p.id ? 'border-foreground bg-foreground' : 'border-border'
                        }`}
                      >
                        {selected === p.id && <span className="h-1.5 w-1.5 rounded-full bg-background" />}
                      </span>
                      <span className="font-serif text-lg text-foreground">
                        {p.durationMonths} Bulan
                      </span>
                      {p.savingsPercent > 0 && (
                        <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium text-foreground">
                          Hemat {p.savingsPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 pl-7">
                    <span className="text-2xl font-semibold text-foreground">{fmtRp(p.price)}</span>
                    <span className="text-sm text-muted-foreground"> / bulan</span>
                    <p className="text-sm text-muted-foreground">Dibayar di muka {fmtRp(p.total)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {plan && (
            <Card className="sticky top-6 p-6">
              <h3 className="mb-4 font-serif text-lg font-medium text-foreground">Ringkasan</h3>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Paket {plan.durationMonths} bulan</span>
                <span className="text-foreground">{fmtRp(plan.total)}</span>
              </div>
              <div className="mb-4 flex justify-between text-sm text-muted-foreground">
                <span>PPN 11%</span>
                <span>Termasuk</span>
              </div>
              <div className="mb-5 flex items-baseline justify-between border-t border-border pt-4">
                <span className="text-sm font-semibold text-foreground">Total dibayar</span>
                <span className="font-serif text-2xl text-foreground">{fmtRp(plan.total)}</span>
              </div>
              <Button type="button" className="w-full" onClick={handlePay} disabled={paying}>
                {paying ? 'Memproses…' : 'Lanjutkan ke pembayaran'}
              </Button>
              <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                Akses langsung setelah pembayaran berhasil. Bisa berhenti kapan saja.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Memuat…
        </div>
      }
    >
      <SubscribeContent />
    </Suspense>
  );
}
