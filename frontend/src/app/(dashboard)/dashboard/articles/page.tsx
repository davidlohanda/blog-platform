'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { usePublication } from '@/hooks/usePublication';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'scheduled' | 'published';
  visibility: 'free' | 'members_only';
  viewsCount: number;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
  tags: Array<{ tag: { id: string; name: string } }>;
}

const STATUS_FILTER = ['Semua', 'Terbit', 'Draft', 'Terjadwal'] as const;
type StatusFilter = (typeof STATUS_FILTER)[number];

const STATUS_MAP: Record<StatusFilter, string | undefined> = {
  Semua: undefined,
  Terbit: 'published',
  Draft: 'draft',
  Terjadwal: 'scheduled',
};

export default function ArticlesPage() {
  const router = useRouter();
  const { pub, loading: pubLoading } = usePublication();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('Semua');
  const [search, setSearch] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!pub) return;
    let cancelled = false;
    const status = STATUS_MAP[activeFilter];
    const params = new URLSearchParams({ limit: '20' });
    if (status) params.set('status', status);
    if (search) params.set('q', search);
    apiClient
      .get<{ data: Article[]; nextCursor: string | null }>(
        `/publications/${pub.id}/articles?${params}`,
      )
      .then(({ data }) => {
        if (!cancelled) {
          setArticles(data.data);
          setNextCursor(data.nextCursor);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pub, activeFilter, search]);

  async function createNewArticle() {
    if (!pub) return;
    setCreating(true);
    try {
      const { data } = await apiClient.post<{ data: Article }>(
        `/publications/${pub.id}/articles`,
        { title: 'Artikel baru tanpa judul' },
      );
      router.push(`/dashboard/articles/${data.data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Gagal membuat artikel. Coba lagi.';
      alert(msg);
      setCreating(false);
    }
  }

  async function deleteArticle(articleId: string) {
    if (!pub) return;
    if (!confirm('Hapus artikel ini?')) return;
    try {
      await apiClient.delete(`/publications/${pub.id}/articles/${articleId}`);
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    } catch {
      // ignore
    }
  }

  function statusBadge(status: Article['status']) {
    if (status === 'published') return <Badge className="bg-foreground/10 text-foreground">Terbit</Badge>;
    if (status === 'draft') return <Badge variant="secondary">Draft</Badge>;
    return <Badge className="bg-foreground/5 text-foreground/60">Terjadwal</Badge>;
  }

  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const scheduledCount = articles.filter((a) => a.status === 'scheduled').length;

  // usePublication auto-redirects to /onboarding if no publication
  if (pubLoading) {
    return (
      <DashboardShell title="Artikel">
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Memuat…</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Artikel"
      subtitle={`${articles.length} tulisan · ${draftCount} draft · ${scheduledCount} terjadwal`}
      publicationName={pub?.name}
      publicationDomain={pub ? `${pub.slug}.lentera.id` : undefined}
      action={
        <Button onClick={createNewArticle} disabled={creating || !pub}>
          {creating ? 'Membuat…' : '+ Tulis baru'}
        </Button>
      }
    >
      <div className="p-8">
        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Input
              placeholder="Cari judul…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {STATUS_FILTER.map((f) => (
              <Button
                key={f}
                type="button"
                variant={activeFilter === f ? 'outline' : 'ghost'}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border">
          {loading ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">Memuat…</p>
          ) : articles.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Belum ada artikel.{' '}
              <button
                className="text-foreground underline"
                onClick={createNewArticle}
              >
                Tulis sekarang
              </button>
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground" style={{ width: '42%' }}>Judul</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Views</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tanggal</th>
                  <th className="w-16 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div>
                        <button
                          className="text-left font-medium text-foreground hover:underline"
                          onClick={() => router.push(`/dashboard/articles/${a.id}`)}
                        >
                          {a.title}
                        </button>
                        {a.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {a.tags.map(({ tag }) => (
                              <span
                                key={tag.id}
                                className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                              >
                                {tag.name}
                              </span>
                            ))}
                            {a.visibility === 'members_only' && (
                              <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] font-medium text-foreground">
                                Premium
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                          {a.author.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {a.author.name.split(' ')[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{statusBadge(a.status)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">
                      {a.viewsCount > 0 ? a.viewsCount.toLocaleString('id-ID') : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {a.status === 'published' && a.publishedAt
                        ? new Date(a.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                        : a.status === 'scheduled' && a.scheduledAt
                          ? `Terjadwal ${new Date(a.scheduledAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
                          : `Diedit ${new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="text-xs text-destructive hover:underline"
                        onClick={() => deleteArticle(a.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {nextCursor && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" type="button">
              Berikutnya →
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
