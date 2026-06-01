import { Suspense } from 'react';
import { headers, cookies } from 'next/headers';
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
    h.get('x-publication-slug') ?? '';

  if (!slug) {
    return {
      title: 'Lentera — Platform Blog Subscription',
      description:
        'Platform blog subscription untuk penulis Indonesia. Buat publication, kumpulkan subscriber, dan hasilkan dari tulisan kamu.',
    };
  }

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

function PlatformLanding({ role = '' }: { role?: string }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <span className="font-serif text-base font-semibold italic text-background">L</span>
          </div>
          <span className="font-serif text-lg font-semibold text-foreground">Lentera</span>
        </div>
        {role === 'platform_admin' ? (
          <Link
            href="/admin/dashboard"
            className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Dashboard Admin
          </Link>
        ) : role ? (
          <Link
            href="/dashboard"
            className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Masuk
          </Link>
        )}
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center md:px-10 md:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Platform Blog Subscription
          </p>
          <h1 className="mb-5 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
            Tulis, kumpulkan subscriber,{' '}
            <span className="italic">dan hasilkan</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Lentera adalah platform blog subscription untuk penulis Indonesia yang ingin membangun
            audiens setia dan penghasilan berulang dari tulisan mereka.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {role === 'platform_admin' ? (
              <Link
                href="/admin/dashboard"
                className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                Ke Dashboard Admin
              </Link>
            ) : role ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                Ke Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                Masuk
              </Link>
            )}
            <a
              href="#cara-kerja"
              className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Pelajari lebih lanjut
            </a>
          </div>
        </div>
      </section>

      {/* Untuk Siapa */}
      <section className="border-t border-border bg-muted/30 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Untuk Siapa
            </p>
            <h2 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
              Dibuat untuk penulis serius
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: '✍️',
                title: 'Penulis Solo',
                desc: 'Bangun newsletter premium, jurnal mingguan, atau blog analisis mendalam. Kamu yang menentukan harga dan audiensnya.',
              },
              {
                icon: '👥',
                title: 'Tim Penulis',
                desc: 'Undang co-author, kelola kontributor, dan terbitkan konten dari satu publication yang terorganisasi.',
              },
              {
                icon: '🎓',
                title: 'Komunitas & Kreator',
                desc: 'Dari newsletter edukasi hingga analisis industri — Lentera cocok untuk siapa saja yang punya sesuatu untuk diajarkan.',
              },
            ].map((card) => (
              <div key={card.title} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-3 text-2xl">{card.icon}</div>
                <h3 className="mb-2 font-serif text-base font-semibold text-foreground">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur Utama */}
      <section className="border-t border-border px-6 py-16 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Fitur Utama
            </p>
            <h2 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
              Semua yang kamu butuhkan
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                icon: '💳',
                title: 'Subscription berbayar',
                desc: 'Terima pembayaran dari subscriber dengan Midtrans. Pilih paket bulanan, 3 bulan, atau tahunan.',
              },
              {
                icon: '✏️',
                title: 'Editor rich text',
                desc: 'Tulis dengan editor berbasis Tiptap — heading, tabel, gambar, kode, dan lebih banyak lagi.',
              },
              {
                icon: '📊',
                title: 'Analytics & revenue',
                desc: 'Pantau jumlah subscriber, MRR, views, dan performa artikel dari satu dashboard.',
              },
              {
                icon: '📧',
                title: 'Email notifikasi',
                desc: 'Subscriber otomatis mendapat email saat artikel baru terbit. Reminder renewal juga terkirim otomatis.',
              },
            ].map((feat) => (
              <div key={feat.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                <div className="shrink-0 text-xl">{feat.icon}</div>
                <div>
                  <h3 className="mb-1 font-serif text-sm font-semibold text-foreground">
                    {feat.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section id="cara-kerja" className="border-t border-border bg-muted/30 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Cara Kerja
            </p>
            <h2 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
              Tiga langkah memulai
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Buat Publication',
                desc: 'Daftarkan diri sebagai owner dan setup nama, slug, serta tampilan publication kamu.',
              },
              {
                step: '02',
                title: 'Tulis Konten',
                desc: 'Mulai dengan artikel gratis untuk membangun audiens, lalu tambahkan konten premium untuk subscriber.',
              },
              {
                step: '03',
                title: 'Terima Subscriber',
                desc: 'Reader bisa berlangganan lewat Midtrans. Kamu menerima pembayaran dikurangi platform fee 15%.',
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-border">
                  <span className="font-mono text-sm font-semibold text-muted-foreground">
                    {s.step}
                  </span>
                </div>
                <h3 className="mb-2 font-serif text-base font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-foreground">
              <span className="font-serif text-[10px] font-semibold italic text-background">L</span>
            </div>
            <span>© 2026 Lentera. Platform Blog Subscription Indonesia.</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">
              Masuk
            </Link>
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

async function HomepageContent() {
  const h = await headers();
  const slug =
    h.get('x-publication-slug') ?? '';

  if (!slug) {
    const jar = await cookies();
    const role = jar.get('refreshToken')
      ? (jar.get('user-role')?.value ?? '')
      : '';
    return <PlatformLanding role={role} />;
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
