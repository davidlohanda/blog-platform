'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { usePublication } from '@/hooks/usePublication';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Subscriber {
  id: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  createdAt: string;
  startedAt: string | null;
  expiresAt: string | null;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
  plan: { durationMonths: number; price: number };
}

const STATUS_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'expired', label: 'Berakhir' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Aktif', variant: 'default' },
  expired: { label: 'Berakhir', variant: 'secondary' },
  cancelled: { label: 'Dibatalkan', variant: 'outline' },
  pending: { label: 'Pending', variant: 'secondary' },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SubscribersPage() {
  const { pub, loading: pubLoading } = usePublication();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchSubscribers = useCallback(
    async (opts: { cursor?: string; reset?: boolean } = {}) => {
      if (!pub) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        if (opts.cursor) params.set('cursor', opts.cursor);

        const { data } = await apiClient.get<{
          data: Subscriber[];
          nextCursor: string | null;
          hasMore: boolean;
        }>(`/publications/${pub.id}/analytics/subscribers?${params.toString()}`);

        setSubscribers((prev) => (opts.reset ? data.data : [...prev, ...data.data]));
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [pub, search, status],
  );

  useEffect(() => {
    if (!pub) return;
    const timer = setTimeout(() => {
      fetchSubscribers({ reset: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [pub, search, status, fetchSubscribers]);

  async function handleExport() {
    if (!pub) return;
    setExporting(true);
    try {
      const response = await apiClient.get(`/publications/${pub.id}/analytics/subscribers/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${pub.slug}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  }

  function formatDuration(months: number): string {
    if (months === 1) return '1 Bulan';
    if (months === 12) return '1 Tahun';
    return `${months} Bulan`;
  }

  if (pubLoading) {
    return (
      <DashboardShell title="Subscriber">
        <div className="p-8">
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Subscriber"
      subtitle={`Kelola dan ekspor daftar subscriber publication kamu`}
      publicationName={pub?.name}
      action={
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Mengekspor…' : 'Export CSV'}
        </Button>
      }
    >
      <div className="p-8">
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Cari nama atau email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex gap-1">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  status === opt.value
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          {loading && subscribers.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted-foreground">Memuat…</p>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2">
              <p className="text-sm font-medium text-foreground">Belum ada subscriber</p>
              <p className="text-xs text-muted-foreground">
                {search || status
                  ? 'Coba ubah filter pencarian.'
                  : 'Subscriber akan muncul di sini setelah ada yang berlangganan.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Member
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Paket
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Mulai
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Berakhir
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subscribers.map((sub) => {
                    const badge = STATUS_BADGE[sub.status] ?? { label: sub.status, variant: 'outline' as const };
                    return (
                      <tr key={sub.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                              {sub.user.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={sub.user.avatarUrl}
                                  alt={sub.user.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                sub.user.name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{sub.user.name}</p>
                              <p className="truncate text-xs text-muted-foreground">{sub.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {formatDuration(sub.plan.durationMonths)}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            Rp {Number(sub.plan.price).toLocaleString('id-ID')}/bln
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {sub.startedAt
                            ? new Date(sub.startedAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {sub.expiresAt
                            ? new Date(sub.expiresAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center border-t border-border p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchSubscribers({ cursor: nextCursor ?? undefined })}
                disabled={loading}
              >
                {loading ? 'Memuat…' : 'Muat lebih banyak'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
