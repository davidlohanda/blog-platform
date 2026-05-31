import { Suspense } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cacheLife, cacheTag } from 'next/cache';
import { Badge } from '@/components/ui/badge';
import {
  getPublicationBySlug,
  getPublicArticle,
  getArticleWithAuth,
  getSeriesForArticle,
  type FullArticle,
  type Publication,
} from '@/lib/pub-data';
import { PublicationNavbar } from '@/components/publication/PublicationNavbar';
import { PubFooter } from '@/components/publication/PubFooter';
import { TiptapRenderer } from '@/components/publication/TiptapRenderer';
import { ArticlePaywall } from '@/components/publication/ArticlePaywall';
import { ArticleLikeButton } from '@/components/publication/ArticleLikeButton';
import { ReadingProgressBar } from '@/components/publication/ReadingProgressBar';
import { SeriesNav } from '@/components/publication/SeriesNav';

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

async function getPubSlug() {
  const h = await headers();
  return (
    h.get('x-publication-slug') ?? process.env.NEXT_PUBLIC_DEV_PUBLICATION_SLUG ?? ''
  );
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ articleSlug: string }>;
}): Promise<Metadata> {
  const { articleSlug } = await params;
  const slug = await getPubSlug();
  if (!slug) return {};
  try {
    const pub = await getPublicationBySlug(slug);
    const article = await getPublicArticle(pub.id, articleSlug);
    return {
      title: article.metaTitle ?? article.title,
      description: article.metaDescription ?? article.excerpt ?? undefined,
      openGraph: {
        title: article.metaTitle ?? article.title,
        description: article.metaDescription ?? article.excerpt ?? undefined,
        images: article.coverImageUrl ? [article.coverImageUrl] : [],
      },
    };
  } catch {
    return {};
  }
}

// ─── Free article content (cached) ────────────────────────────────────────────

async function FreeArticleContent({ article }: { article: FullArticle }) {
  'use cache';
  cacheTag(`article-content:${article.publicationId}:${article.slug}`);
  cacheLife('hours');
  return (
    <div className="prose article-body mx-auto max-w-[680px]">
      <TiptapRenderer content={article.content} />
    </div>
  );
}

// ─── Article header (cached) ──────────────────────────────────────────────────

async function ArticleHeader({ article, pub }: { article: FullArticle; pub: Publication }) {
  'use cache';
  cacheTag(`article-header:${pub.id}:${article.slug}`);
  cacheLife('hours');
  const isPremium = article.visibility === 'members_only';
  const firstTag = article.tags[0]?.tag;
  return (
    <div className="mx-auto max-w-[720px]">
      <div className="mb-5 flex flex-wrap gap-2">
        {firstTag && <Badge variant="secondary">{firstTag.name}</Badge>}
        {isPremium && (
          <Badge className="bg-foreground/10 text-[10px] font-semibold text-foreground">
            PREMIUM
          </Badge>
        )}
      </div>
      <h1 className="mb-5 font-heading text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
        {article.title}
      </h1>
      {article.excerpt && (
        <p className="mb-7 font-body text-xl leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
      )}
      <div className="flex items-center gap-4 border-b border-border pb-7">
        {article.author.avatarUrl ? (
          <Image
            src={article.author.avatarUrl}
            alt={article.author.name}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-sm font-semibold">
            {article.author.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="flex-1">
          <div className="text-sm font-semibold">{article.author.name}</div>
          <div className="text-xs text-muted-foreground">
            {formatDate(article.publishedAt)}
            {article.readingTime && ` · ${article.readingTime} menit baca`}
          </div>
        </div>
        {!isPremium && (
          <Link
            href="/subscribe"
            className="hidden rounded-full border border-border px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-muted md:block"
          >
            + Berlangganan
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Author bio card (cached) ─────────────────────────────────────────────────

async function AuthorBioCard({ article }: { article: FullArticle }) {
  'use cache';
  cacheTag(`author-bio:${article.authorId}`);
  cacheLife('hours');
  return (
    <div className="mx-auto mt-8 max-w-[680px] rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-start gap-4">
        {article.author.avatarUrl ? (
          <Image
            src={article.author.avatarUrl}
            alt={article.author.name}
            width={56}
            height={56}
            className="rounded-full object-cover"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted font-heading font-semibold">
            {article.author.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div>
          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ditulis oleh
          </div>
          <div className="font-heading text-xl font-semibold">{article.author.name}</div>
        </div>
      </div>
      {article.author.bio && (
        <p className="text-sm leading-relaxed text-muted-foreground">{article.author.bio}</p>
      )}
    </div>
  );
}

// ─── Series nav (cached) ──────────────────────────────────────────────────────

async function SeriesNavSection({ pub, article }: { pub: Publication; article: FullArticle }) {
  'use cache';
  cacheTag(`series-nav:${pub.id}:${article.slug}`);
  cacheLife('hours');

  if (!article.seriesLinks || article.seriesLinks.length === 0) return null;
  const seriesLink = article.seriesLinks[0];
  if (!seriesLink) return null;

  let series: Awaited<ReturnType<typeof getSeriesForArticle>> | null = null;
  try {
    series = await getSeriesForArticle(pub.id, seriesLink.series.slug);
  } catch {
    return null;
  }
  if (!series) return null;

  return (
    <div className="mx-auto max-w-[680px]">
      <SeriesNav
        seriesTitle={series.title}
        seriesSlug={series.slug}
        currentSlug={article.slug}
        articles={series.articles}
      />
    </div>
  );
}

// ─── Action bar ───────────────────────────────────────────────────────────────

function ActionBar({ pub, article }: { pub: Publication; article: FullArticle }) {
  return (
    <div className="mx-auto my-8 flex max-w-[680px] items-center justify-between border-b border-t border-border py-4">
      <div className="flex gap-1">
        <ArticleLikeButton
          pubId={pub.id}
          articleId={article.id}
          initialLiked={false}
          initialCount={article.likesCount}
        />
      </div>
    </div>
  );
}

// ─── Article page content (async, reads params + headers) ─────────────────────

async function ArticlePageContent({
  params,
}: {
  params: Promise<{ articleSlug: string }>;
}) {
  const { articleSlug } = await params;
  const pubSlug = await getPubSlug();

  if (!pubSlug) notFound();

  const pub = await getPublicationBySlug(pubSlug);

  let article: FullArticle;
  let isMember = false;

  try {
    article = await getPublicArticle(pub.id, articleSlug);
  } catch {
    notFound();
  }

  if (article.visibility === 'members_only') {
    try {
      const authArticle = await getArticleWithAuth(pub.id, articleSlug);
      isMember = authArticle.content !== null;
      article = authArticle;
    } catch {
      // Not authenticated — keep article without content
    }
  }

  const isPremium = article.visibility === 'members_only';

  return (
    <div className="min-h-screen bg-background">
      <PublicationNavbar pub={pub} />
      <ReadingProgressBar />

      <article className="mx-auto max-w-[1040px] px-4 pb-16 pt-14 md:px-8">
        <ArticleHeader article={article} pub={pub} />

        {article.coverImageUrl && (
          <div className="mx-auto my-10 max-w-[920px] overflow-hidden rounded-2xl bg-muted">
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              width={920}
              height={460}
              className="aspect-[2/1] w-full object-cover"
              priority
            />
          </div>
        )}

        {isPremium && !isMember ? (
          <div className="mx-auto max-w-[680px]">
            <div
              className="prose article-body relative overflow-hidden"
              style={{ maxHeight: '320px' }}
            >
              <TiptapRenderer content={article.content} />
            </div>
            <ArticlePaywall pubName={pub.name} pubId={pub.id} articleSlug={articleSlug} />
          </div>
        ) : article.visibility === 'free' ? (
          <FreeArticleContent article={article} />
        ) : (
          <div className="prose article-body mx-auto max-w-[680px]">
            <TiptapRenderer content={article.content} />
          </div>
        )}

        {(!isPremium || isMember) && (
          <>
            <ActionBar pub={pub} article={article} />
            <SeriesNavSection pub={pub} article={article} />
            <AuthorBioCard article={article} />
          </>
        )}

        {isPremium && !isMember && <AuthorBioCard article={article} />}
      </article>

      <PubFooter pub={pub} />
    </div>
  );
}

// ─── Page (Suspense wrapper) ───────────────────────────────────────────────────

export default function ArticlePage({
  params,
}: {
  params: Promise<{ articleSlug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground text-sm">Memuat artikel…</p>
        </div>
      }
    >
      <ArticlePageContent params={params} />
    </Suspense>
  );
}
