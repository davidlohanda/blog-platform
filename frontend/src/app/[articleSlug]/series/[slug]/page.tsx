// Dev path-based routing for series pages.
// In production, subdomain routing uses (publication)/series/[slug]/page.tsx instead.
// Note: outer [articleSlug] param = publication slug, inner [slug] param = series slug.

import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getPublicationBySlug, getPublicSeriesDetail } from '@/lib/pub-data';
import { PublicationNavbar } from '@/components/publication/PublicationNavbar';
import { PubFooter } from '@/components/publication/PubFooter';
import { SeriesArticleList } from '@/components/publication/SeriesArticleList';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ articleSlug: string; slug: string }>;
}): Promise<Metadata> {
  try {
    const { articleSlug: pubSlug, slug } = await params;
    const pub = await getPublicationBySlug(pubSlug);
    const series = await getPublicSeriesDetail(pub.id, slug);
    return {
      title: `${series.title} — ${pub.name}`,
      description: series.description ?? `Series oleh ${series.author.name}`,
    };
  } catch {
    return {};
  }
}

async function SeriesPageContent({
  params,
}: {
  params: Promise<{ articleSlug: string; slug: string }>;
}) {
  // outer [articleSlug] = publication slug, inner [slug] = series slug
  const { articleSlug: pubSlug, slug } = await params;

  if (process.env.NODE_ENV !== 'development') {
    redirect(`/series/${slug}`);
  }

  const pub = await getPublicationBySlug(pubSlug).catch(() => null);
  if (!pub) notFound();

  let series;
  try {
    series = await getPublicSeriesDetail(pub.id, slug);
  } catch {
    notFound();
  }

  const publishedArticles = series!.articles
    .filter((a) => a.article.status === 'published')
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="min-h-screen bg-background">
      <PublicationNavbar pub={pub} />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          {series!.coverImageUrl && (
            <div className="relative mb-6 aspect-[2.5/1] overflow-hidden rounded-xl">
              <Image
                src={series!.coverImageUrl}
                alt={series!.title}
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
            {series!.title}
          </h1>
          {series!.description && (
            <p className="mb-4 text-base leading-relaxed text-muted-foreground">
              {series!.description}
            </p>
          )}
          <div className="flex items-center gap-3">
            {series!.author.avatarUrl ? (
              <Image
                src={series!.author.avatarUrl}
                alt={series!.author.name}
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {series!.author.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              oleh <span className="font-medium text-foreground">{series!.author.name}</span>
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

        {publishedArticles.length > 0 ? (
          <SeriesArticleList articles={publishedArticles} pubSlug={pub.slug} />
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

export default function SeriesPage({
  params,
}: {
  params: Promise<{ articleSlug: string; slug: string }>;
}) {
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
