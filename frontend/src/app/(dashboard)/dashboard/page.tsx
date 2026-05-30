'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { usePublication } from '@/hooks/usePublication';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Overview {
  activeSubscribers: number;
  subscriberDelta: number;
  newThisMonth: number;
  mrr: number;
  totalViews: number;
  totalArticles: number;
  topArticles: Array<{
    id: string;
    title: string;
    slug: string;
    viewsCount: number;
    likesCount: number;
    publishedAt: string | null;
    visibility: 'free' | 'members_only';
  }>;
}

interface ChartPoint {
  date: string;
  count: number;
}

type Range = '30d' | '6m' | '12m';

const RANGE_LABELS: Record<Range, string> = {
  '30d': '30 Hari',
  '6m': '6 Bulan',
  '12m': '12 Bulan',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  delta,
  sub,
}: {
  label: string;
  value: string | number;
  delta?: number;
  sub?: string;
}) {
  return (
    <Card className="p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="font-serif text-3xl font-medium tracking-tight text-foreground">{value}</p>
      {delta !== undefined && (
        <p
          className={`mt-1 text-xs font-medium ${delta >= 0 ? 'text-foreground/60' : 'text-destructive'}`}
        >
          {delta >= 0 ? '+' : ''}
          {delta} vs bulan lalu
        </p>
      )}
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
}

function formatChartDate(date: string, range: Range): string {
  if (range === '30d') {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }
  const [year, month] = date.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
  return d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
}

function formatMRR(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { pub, loading: pubLoading } = usePublication();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [range, setRange] = useState<Range>('30d');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    if (!pub) return;
    let cancelled = false;
    apiClient
      .get<{ data: Overview }>(`/publications/${pub.id}/analytics/overview`)
      .then(({ data }) => { if (!cancelled) setOverview(data.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pub]);

  useEffect(() => {
    if (!pub) return;
    let cancelled = false;
    apiClient
      .get<{ data: ChartPoint[] }>(
        `/publications/${pub.id}/analytics/subscribers-chart?range=${range}`,
      )
      .then(({ data }) => { if (!cancelled) setChartData(data.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setChartLoading(false); });
    return () => { cancelled = true; };
  }, [pub, range]);

  if (pubLoading || loading) {
    return (
      <DashboardShell title="Overview">
        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-24 animate-pulse bg-muted p-5" />
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Overview"
      publicationName={pub?.name}
      action={
        <div className="flex gap-2">
          {pub?.slug && (
            <Button variant="outline" size="sm">
              <Link href={`/`} target="_blank" rel="noopener noreferrer">
                Lihat publication
              </Link>
            </Button>
          )}
          <Button size="sm">
            <Link href="/dashboard/articles/new">Tulis baru</Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 p-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Subscriber Aktif"
            value={overview?.activeSubscribers ?? 0}
            delta={overview?.subscriberDelta}
          />
          <StatCard
            label="MRR Estimasi"
            value={formatMRR(overview?.mrr ?? 0)}
            sub={`${overview?.newThisMonth ?? 0} baru bulan ini`}
          />
          <StatCard
            label="Total Views"
            value={(overview?.totalViews ?? 0).toLocaleString('id-ID')}
          />
          <StatCard label="Artikel Terbit" value={overview?.totalArticles ?? 0} />
        </div>

        {/* Subscriber Growth Chart */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Subscriber Baru</h2>
              <p className="text-xs text-muted-foreground">Aktivasi subscription baru per periode</p>
            </div>
            <div className="flex gap-1">
              {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    range === r
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {RANGE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {chartLoading ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted-foreground">Memuat…</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatChartDate(v as string, range)}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  interval={range === '30d' ? 6 : 0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                  formatter={(v) => [v, 'Subscriber baru']}
                  labelFormatter={(l) => formatChartDate(String(l), range)}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top Articles */}
        {(overview?.topArticles?.length ?? 0) > 0 && (
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Artikel Terpopuler</h2>
            <div className="divide-y divide-border">
              {overview!.topArticles.map((article, i) => (
                <div key={article.id} className="flex items-center gap-4 py-3">
                  <span className="w-5 shrink-0 text-right text-sm font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </p>
                  </div>
                  {article.visibility === 'members_only' && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      Premium
                    </Badge>
                  )}
                  <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    <span>{article.viewsCount.toLocaleString('id-ID')} views</span>
                    <span>{article.likesCount} likes</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <Link
                href="/dashboard/articles"
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Lihat semua artikel →
              </Link>
            </div>
          </Card>
        )}

        {/* Empty state */}
        {!loading && overview?.totalArticles === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <p className="mb-2 text-base font-medium text-foreground">Belum ada artikel</p>
            <p className="mb-6 text-sm text-muted-foreground">
              Mulai menulis untuk melihat analytics publication-mu di sini.
            </p>
            <Button>
              <Link href="/dashboard/articles/new">Tulis artikel pertama</Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
