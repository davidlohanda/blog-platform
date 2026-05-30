import { Suspense } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cacheTag } from 'next/cache';
import { Badge } from '@/components/ui/badge';
import { getPublicationBySlug, getPublicSeriesDetail } from '@/lib/pub-data';
import { PublicationNavbar } from '@/components/publication/PublicationNavbar';
import { PubFooter } from '@/components/publication/PubFooter';

async function getPubSlug() {
  const h = await headers();
  return h.get('x-publication-slug') ?? process.env.NEXT_PUBLIC_DEV_PUBLICATION_SLUG ?? '';
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

// ─── Series content (reads dynamic headers — wrapped in Suspense) ─────────────

async function SeriesPageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pubSlug = await getPubSlug();
  if (!pubSlug) notFound();

  const pub = await getPublicationBySlug(pubSlug);
  cacheTag(`pub:${pub.id}`);

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

          {/* Progress bar placeholder — X/Y articles in series */}
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

        {/* Article List */}
        {publishedArticles.length > 0 ? (
          <div className="space-y-3">
            {publishedArticles.map((item, index) => {
              const article = item.article;
              return (
                <Link
                  key={article.id}
                  href={`/${article.slug}`}
                  className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-base font-semibold text-foreground group-hover:underline">
                        {article.title}
                      </h2>
                      {article.visibility === 'members_only' && (
                        <Badge variant="secondary" className="text-[10px]">
                          Premium
                        </Badge>
                      )}
                    </div>
                    {article.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      {article.publishedAt && (
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                      {article.readingTime && (
                        <span>{article.readingTime} menit baca</span>
                      )}
                    </div>
                  </div>

                  {article.coverImageUrl && (
                    <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg sm:block">
                      <Image
                        src={article.coverImageUrl}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
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

// ─── Page (Suspense wrapper) ──────────────────────────────────────────────────

export default function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Memuat series…</p>
        </div>
      }
    >
      <SeriesPageContent params={params} />
    </Suspense>
  );
}
