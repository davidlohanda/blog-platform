import { Suspense } from 'react';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { cacheLife, cacheTag } from 'next/cache';
import {
  getPublicationBySlug,
  getPublicArticles,
  getPublicAuthors,
  type Publication,
  type PublicArticle,
  type PublicAuthor,
} from '@/lib/pub-data';
import { PublicationNavbar } from '@/components/publication/PublicationNavbar';
import { PubFooter } from '@/components/publication/PubFooter';
import { ArticleCard } from '@/components/publication/ArticleCard';

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const slug =
    h.get('x-publication-slug') ?? process.env.NEXT_PUBLIC_DEV_PUBLICATION_SLUG ?? '';
  if (!slug) return {};
  try {
    const pub = await getPublicationBySlug(slug);
    return {
      title: pub.name,
      description: pub.description ?? undefined,
      openGraph: {
        title: pub.name,
        description: pub.description ?? undefined,
        images: pub.logoUrl ? [pub.logoUrl] : [],
      },
    };
  } catch {
    return {};
  }
}

async function HeroSection({ pub }: { pub: Publication }) {
  'use cache';
  cacheTag(`hero:${pub.id}`);
  cacheLife('minutes');
  return (
    <section className="border-b border-border bg-background px-4 py-16 text-center md:px-8 md:py-20">
      <div className="mx-auto max-w-[920px]">
        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Platform blog · Lentera
        </p>
        <h1 className="mb-5 font-heading text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          {pub.name}
        </h1>
        {pub.description && (
          <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {pub.description}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/subscribe"
            className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-foreground/90"
          >
            Berlangganan
          </Link>
          <Link
            href="#articles"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Baca dulu, gratis
          </Link>
        </div>
      </div>
    </section>
  );
}

async function FeaturedSection({ pub, articles }: { pub: Publication; articles: PublicArticle[] }) {
  'use cache';
  cacheTag(`featured:${pub.id}`);
  cacheLife('minutes');
  const featured = articles[0];
  if (!featured) return null;
  return (
    <section id="articles" className="px-4 pb-6 pt-14 md:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-heading text-2xl font-semibold">Pilihan terbaru</h2>
          <Link
            href="/articles"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Semua tulisan →
          </Link>
        </div>
        <ArticleCard article={featured} featured />
      </div>
    </section>
  );
}

async function ArticleGridSection({ pub, articles }: { pub: Publication; articles: PublicArticle[] }) {
  'use cache';
  cacheTag(`grid:${pub.id}`);
  cacheLife('minutes');
  const grid = articles.slice(1, 5);
  if (grid.length === 0) return null;
  return (
    <section className="px-4 pb-12 pt-6 md:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="border-t border-border pt-10">
          <div className="grid gap-10 md:grid-cols-2">
            {grid.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

async function AuthorsSection({
  pub,
  authors,
}: {
  pub: Publication;
  authors: PublicAuthor[];
}) {
  'use cache';
  cacheTag(`author-section:${pub.id}`);
  cacheLife('hours');
  if (authors.length === 0) return null;
  return (
    <section className="border-b border-t border-border bg-muted/30 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Para penulis
          </p>
          <h2 className="font-heading text-2xl font-semibold">
            Suara-suara di balik {pub.name}
          </h2>
        </div>
        <div
          className={`grid gap-5 ${
            authors.length === 1
              ? 'mx-auto max-w-md'
              : authors.length === 2
                ? 'md:grid-cols-2'
                : 'md:grid-cols-3'
          }`}
        >
          {authors.map((author) => (
            <div key={author.id} className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                {author.avatarUrl ? (
                  <Image
                    src={author.avatarUrl}
                    alt={author.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-sm font-semibold">
                    {author.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div>
                  <div className="font-heading text-base font-semibold">{author.name}</div>
                  <div className="text-xs capitalize text-muted-foreground">{author.role}</div>
                </div>
              </div>
              {author.bio && (
                <p className="text-sm leading-relaxed text-muted-foreground">{author.bio}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function MoreArticlesSection({ pub, articles }: { pub: Publication; articles: PublicArticle[] }) {
  'use cache';
  cacheTag(`more:${pub.id}`);
  cacheLife('minutes');
  const more = articles.slice(5);
  if (more.length === 0) return null;
  return (
    <section className="px-4 py-12 md:px-8">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="mb-6 font-heading text-2xl font-semibold">Sebelumnya</h2>
        <div className="flex flex-col divide-y divide-border">
          {more.map((a) => {
            const firstTag = a.tags[0]?.tag;
            const isPremium = a.visibility === 'members_only';
            return (
              <Link
                key={a.id}
                href={`/${a.slug}`}
                className="grid gap-6 py-6 text-inherit no-underline md:grid-cols-[1fr_160px]"
              >
                <div>
                  <div className="mb-2 flex gap-2">
                    {firstTag && (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                        {firstTag.name}
                      </span>
                    )}
                    {isPremium && (
                      <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-[10px] font-semibold text-foreground">
                        PREMIUM
                      </span>
                    )}
                  </div>
                  <h3 className="mb-1.5 font-heading text-xl font-semibold leading-snug">
                    {a.title}
                  </h3>
                  {a.excerpt && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {a.excerpt}
                    </p>
                  )}
                </div>
                <div className="hidden overflow-hidden rounded-lg bg-muted md:block">
                  {a.coverImageUrl ? (
                    <Image
                      src={a.coverImageUrl}
                      alt={a.title}
                      width={160}
                      height={100}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

async function SubscribeBand({ pub }: { pub: Publication }) {
  'use cache';
  cacheTag(`subscribe-band:${pub.id}`);
  cacheLife('hours');
  return (
    <section className="bg-foreground px-4 py-16 text-primary-foreground md:px-8">
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="mb-4 font-heading text-3xl font-semibold">
          Baca lebih banyak dari {pub.name}
        </h2>
        <p className="mb-7 text-base leading-relaxed opacity-75">
          Berlangganan untuk mengakses seluruh arsip dan konten eksklusif tiap pekan.
        </p>
        <Link
          href="/subscribe"
          className="inline-block rounded-full bg-background px-7 py-3 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
        >
          Berlangganan sekarang
        </Link>
        <p className="mt-4 text-xs opacity-50">Batalkan kapan saja · Tanpa iklan</p>
      </div>
    </section>
  );
}

async function HomepageContent() {
  const h = await headers();
  const slug =
    h.get('x-publication-slug') ?? process.env.NEXT_PUBLIC_DEV_PUBLICATION_SLUG ?? '';

  if (!slug) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Set <code>NEXT_PUBLIC_DEV_PUBLICATION_SLUG</code> for local dev.
        </p>
      </div>
    );
  }

  const pub = await getPublicationBySlug(slug);
  const [articlesResult, authors] = await Promise.all([
    getPublicArticles(pub.id, { limit: 10 }),
    getPublicAuthors(pub.id).catch(() => [] as PublicAuthor[]),
  ]);
  const articles = articlesResult.data;

  return (
    <div className="min-h-screen bg-background">
      <PublicationNavbar pub={pub} activePage="home" />
      <main>
        <HeroSection pub={pub} />
        <FeaturedSection pub={pub} articles={articles} />
        <ArticleGridSection pub={pub} articles={articles} />
        <AuthorsSection pub={pub} authors={authors} />
        <MoreArticlesSection pub={pub} articles={articles} />
        <SubscribeBand pub={pub} />
      </main>
      <PubFooter pub={pub} />
    </div>
  );
}

export default function PublicationHomepage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Memuat…</p>
        </div>
      }
    >
      <HomepageContent />
    </Suspense>
  );
}
