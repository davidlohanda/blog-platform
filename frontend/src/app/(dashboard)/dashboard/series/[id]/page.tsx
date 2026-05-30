'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { KeyboardSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { usePublication } from '@/hooks/usePublication';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SeriesArticle {
  orderIndex: number;
  article: {
    id: string;
    title: string;
    slug: string;
    status: string;
    visibility: string;
    readingTime: number | null;
    publishedAt: string | null;
  };
}

interface SeriesDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  articles: SeriesArticle[];
}

interface AvailableArticle {
  id: string;
  title: string;
  slug: string;
  status: string;
}

// ─── Sortable Item ────────────────────────────────────────────────────────────

function SortableArticleItem({
  item,
  onRemove,
}: {
  item: SeriesArticle;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.article.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="5" cy="3.5" r="1.2" />
          <circle cx="9" cy="3.5" r="1.2" />
          <circle cx="5" cy="7" r="1.2" />
          <circle cx="9" cy="7" r="1.2" />
          <circle cx="5" cy="10.5" r="1.2" />
          <circle cx="9" cy="10.5" r="1.2" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.article.title}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground capitalize">{item.article.status}</span>
          {item.article.visibility === 'members_only' && (
            <Badge variant="secondary" className="text-[10px]">
              Premium
            </Badge>
          )}
          {item.article.readingTime && (
            <span className="text-xs text-muted-foreground">{item.article.readingTime} menit</span>
          )}
        </div>
      </div>

      <button
        onClick={() => onRemove(item.article.id)}
        className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
        aria-label="Hapus dari series"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function SeriesDetailContent() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;
  const { pub, loading: pubLoading } = usePublication();

  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<SeriesArticle[]>([]);
  const [available, setAvailable] = useState<AvailableArticle[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!pub) return;
    let cancelled = false;
    Promise.all([
      apiClient.get<{ data: SeriesDetail }>(`/publications/${pub.id}/series/${seriesId}`),
      apiClient.get<{ data: AvailableArticle[] }>(`/publications/${pub.id}/articles?limit=100`),
    ])
      .then(([seriesRes, articlesRes]) => {
        if (cancelled) return;
        setSeries(seriesRes.data.data);
        setArticles(seriesRes.data.data.articles.slice().sort((a, b) => a.orderIndex - b.orderIndex));
        const inSeries = new Set(seriesRes.data.data.articles.map((a) => a.article.id));
        setAvailable((articlesRes.data.data as unknown as { data: AvailableArticle[] }).data?.filter((a) => !inSeries.has(a.id)) ?? []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pub, seriesId]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setArticles((prev) => {
      const oldIndex = prev.findIndex((a) => a.article.id === active.id);
      const newIndex = prev.findIndex((a) => a.article.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setSaved(false);
  }

  async function handleSaveOrder() {
    if (!pub) return;
    setSaving(true);
    try {
      await apiClient.patch(`/publications/${pub.id}/series/${seriesId}/articles/reorder`, {
        orderedArticleIds: articles.map((a) => a.article.id),
      });
      setSaved(true);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function handleAddArticle(article: AvailableArticle) {
    if (!pub) return;
    try {
      await apiClient.post(`/publications/${pub.id}/series/${seriesId}/articles`, {
        articleId: article.id,
        orderIndex: articles.length,
      });
      setArticles((prev) => [
        ...prev,
        { orderIndex: prev.length, article: { ...article, visibility: 'free', readingTime: null, publishedAt: null } },
      ]);
      setAvailable((prev) => prev.filter((a) => a.id !== article.id));
      setSaved(false);
    } catch {
      // ignore
    }
  }

  async function handleRemoveArticle(articleId: string) {
    if (!pub) return;
    try {
      await apiClient.delete(`/publications/${pub.id}/series/${seriesId}/articles/${articleId}`);
      const removed = articles.find((a) => a.article.id === articleId);
      setArticles((prev) => prev.filter((a) => a.article.id !== articleId));
      if (removed) {
        setAvailable((prev) => [
          ...prev,
          { id: removed.article.id, title: removed.article.title, slug: removed.article.slug, status: removed.article.status },
        ]);
      }
      setSaved(false);
    } catch {
      // ignore
    }
  }

  const filteredAvailable = available.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (pubLoading || loading) {
    return (
      <DashboardShell title="Series">
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Memuat…
        </div>
      </DashboardShell>
    );
  }

  if (!series) {
    return (
      <DashboardShell title="Series tidak ditemukan">
        <div className="p-8">
          <Button variant="outline" onClick={() => router.push('/dashboard/series')}>
            ← Kembali ke series
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={series.title}
      subtitle={series.description ?? undefined}
      publicationName={pub?.name}
      action={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/series')}>
            ← Kembali
          </Button>
          <Button size="sm" onClick={handleSaveOrder} disabled={saving}>
            {saving ? 'Menyimpan…' : saved ? '✓ Tersimpan' : 'Simpan urutan'}
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 p-8 lg:grid-cols-2">
        {/* Article order panel */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Artikel dalam series ({articles.length})
          </h2>
          {articles.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">Belum ada artikel.</p>
              <p className="text-xs text-muted-foreground">Tambahkan dari panel kanan.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={articles.map((a) => a.article.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {articles.map((item) => (
                    <SortableArticleItem
                      key={item.article.id}
                      item={item}
                      onRemove={handleRemoveArticle}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Seret untuk mengubah urutan, lalu simpan.
          </p>
        </div>

        {/* Available articles panel */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Tambah artikel</h2>
          <Input
            placeholder="Cari artikel…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />
          <Card className="overflow-hidden">
            {filteredAvailable.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  {available.length === 0 ? 'Semua artikel sudah masuk series.' : 'Tidak ada artikel yang cocok.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredAvailable.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{article.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{article.status}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleAddArticle(article)}>
                      Tambah
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="mt-4">
            <Link
              href="/dashboard/articles/new"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              + Tulis artikel baru →
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

export default function SeriesDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Memuat…</p>
        </div>
      }
    >
      <SeriesDetailContent />
    </Suspense>
  );
}
