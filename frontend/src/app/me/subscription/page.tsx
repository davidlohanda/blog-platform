'use client';

import { Suspense, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';

interface HistoryItem {
  id: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  grossAmount: string;
  paymentMethod: string | null;
  startedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  plan: { durationMonths: number };
  publication: { id: string; name: string; slug: string };
}

const fmtRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export default function MemberSubscriptionPage() {
  return (
    <Suspense>
      <SubscriptionContent />
    </Suspense>
  );
}

function SubscriptionContent() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  // Capture "now" once on mount — avoids impure Date.now() during render
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{ data: HistoryItem[] }>('/subscriptions/me/history')
      .then(({ data }) => { if (!cancelled) setHistory(data.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const active = history.find((h) => h.status === 'active');

  async function handleCancel(id: string) {
    if (!confirm('Batalkan subscription? Akses tetap aktif sampai periode berakhir.')) return;
    setCancelling(id);
    try {
      await apiClient.delete(`/subscriptions/${id}`);
      setHistory((prev) =>
        prev.map((h) => (h.id === id ? { ...h, status: 'cancelled' as const } : h)),
      );
    } catch {
      // ignore
    } finally {
      setCancelling(null);
    }
  }

  function statusBadge(status: HistoryItem['status']) {
    if (status === 'active') return <Badge className="bg-foreground/10 text-foreground">Aktif</Badge>;
    if (status === 'pending') return <Badge variant="secondary">Pending</Badge>;
    if (status === 'cancelled') return <Badge variant="secondary">Dibatalkan</Badge>;
    return <Badge className="bg-foreground/5 text-foreground/50">Berakhir</Badge>;
  }

  function progress(sub: HistoryItem): { pct: number; daysLeft: number } {
    if (!sub.startedAt || !sub.expiresAt) return { pct: 0, daysLeft: 0 };
    const start = new Date(sub.startedAt).getTime();
    const end = new Date(sub.expiresAt).getTime();
    const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    return { pct, daysLeft };
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Akun
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
            Subscription
          </h1>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat…</p>
        ) : (
          <>
            {/* Active plan */}
            {active ? (
              <Card className="relative mb-6 overflow-hidden p-6">
                <div className="absolute inset-x-0 top-0 h-1 bg-foreground" />
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      {statusBadge(active.status)}
                      <span className="text-xs text-muted-foreground">
                        Paket {active.plan.durationMonths} Bulan
                      </span>
                    </div>
                    <h2 className="mb-2 font-serif text-2xl font-medium text-foreground">
                      Member {active.publication.name}
                    </h2>
                    {active.startedAt && active.expiresAt && (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Berlangganan sejak {fmtDate(active.startedAt)}. Berakhir{' '}
                        {fmtDate(active.expiresAt)}.
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">Dibayar</p>
                    <p className="font-serif text-2xl">{fmtRp(Number(active.grossAmount))}</p>
                  </div>
                </div>

                {/* Progress */}
                {active.startedAt && active.expiresAt && (
                  <div className="mt-6 rounded-lg bg-muted p-4">
                    <div className="mb-2 flex items-baseline justify-between text-xs text-muted-foreground">
                      <span>Periode aktif</span>
                      <span>{progress(active).daysLeft} hari tersisa</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-background">
                      <div
                        className="h-full bg-foreground"
                        style={{ width: `${progress(active).pct}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-5 border-t border-border pt-4">
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Berhenti berlangganan</p>
                      <p className="text-xs text-muted-foreground">
                        Akses tetap aktif hingga periode berakhir.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      type="button"
                      className="shrink-0 text-destructive"
                      onClick={() => handleCancel(active.id)}
                      disabled={cancelling === active.id}
                    >
                      {cancelling === active.id ? 'Membatalkan…' : 'Batalkan'}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="mb-6 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Kamu belum punya subscription aktif.
                </p>
              </Card>
            )}

            {/* Transaction history */}
            <Card className="overflow-hidden p-0">
              <div className="border-b border-border px-6 py-4">
                <h3 className="font-serif text-lg font-medium text-foreground">Riwayat transaksi</h3>
              </div>
              {history.length === 0 ? (
                <p className="px-6 py-8 text-sm text-muted-foreground">Belum ada transaksi.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Tanggal</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Publication</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Metode</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Jumlah</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-b border-border last:border-0">
                        <td className="px-6 py-3 text-muted-foreground">{fmtDate(h.createdAt)}</td>
                        <td className="px-4 py-3 text-foreground">{h.publication.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{h.paymentMethod ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-mono">{fmtRp(Number(h.grossAmount))}</td>
                        <td className="px-4 py-3">{statusBadge(h.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
