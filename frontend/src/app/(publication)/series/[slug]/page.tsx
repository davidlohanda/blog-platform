import { Suspense } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getPublicationBySlug, getPublicSeriesDetail } from '@/lib/pub-data';
import { PublicationNavbar } from '@/components/publication/PublicationNavbar';
import { PubFooter } from '@/components/publication/PubFooter';
import { SeriesArticleList } from '@/components/publication/SeriesArticleList';

async function getPubSlug() {
  const h = await headers();
  return h.get('x-publication-slug') ?? '';
}

// ─── generateMetadata ──────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const pubSlug = await getPubSlug();
    if (!pubSlug) return {};
    const pub = await getPublicationBySlug(pubSlug);
    const series = await getPublicSeriesDetail(pub.id, slug);
    return {
      title: `${series.title} — ${pub.name}`,
      description: series.description ?? `Series oleh ${series.author.name}`,
      openGraph: {
        title: `${series.title} — ${pub.name}`,
        description: series.description ?? undefined,
        images: series.coverImageUrl ? [series.coverImageUrl] : [],
      },
    };
  } catch {
    return {};
  }
}

// ─── Series content ───────────────────────────────────────────────────────────

async function SeriesPageContent({
  pubSlug,
  params,
}: {
  pubSlug: string;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!pubSlug) notFound();

  const pub = await getPublicationBySlug(pubSlug);

  let series;
  try {
    series = await getPublicSeriesDetail(pub.id, slug);
  } catch {
    notFound();
  }

  const publishedArticles = series.articles
    .filter((a) => a.article.status === 'published')
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="min-h-screen bg-background">
      <PublicationNavbar pub={pub} />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Series Header */}
        <div className="mb-10">
          {series.coverImageUrl && (
            <div className="relative mb-6 aspect-[2.5/1] overflow-hidden rounded-xl">
              <Image
                src={series.coverImageUrl}
                alt={series.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Series
          </p>
          <h1 className="mb-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {series.title}
          </h1>

          {series.description && (
            <p className="mb-4 text-base leading-relaxed text-muted-foreground">
              {series.description}
            </p>
          )}

          <div className="flex items-center gap-3">
            {series.author.avatarUrl ? (
              <Image
                src={series.author.avatarUrl}
                alt={series.author.name}
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {series.author.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              oleh <span className="font-medium text-foreground">{series.author.name}</span>
              {' · '}
              {publishedArticles.length} artikel
            </span>
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress series</span>
              <span>0 / {publishedArticles.length} selesai</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-0 rounded-full bg-foreground/40 transition-all" />
            </div>
          </div>
        </div>

        {/* Article List — client component handles premium modal */}
        {publishedArticles.length > 0 ? (
          <SeriesArticleList articles={publishedArticles} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <p className="text-sm text-muted-foreground">
              Belum ada artikel yang diterbitkan dalam series ini.
            </p>
          </div>
        )}
      </main>

      <PubFooter pub={pub} />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const pubSlug = await getPubSlug();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Memuat series…</p>
        </div>
      }
    >
      <SeriesPageContent pubSlug={pubSlug} params={params} />
    </Suspense>
  );
}
