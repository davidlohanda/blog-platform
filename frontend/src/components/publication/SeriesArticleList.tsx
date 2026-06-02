'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

interface ArticleItem {
  orderIndex: number;
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    coverImageUrl: string | null;
    visibility: string;
    status: string;
    publishedAt: string | null;
    readingTime: number | null;
  };
}

interface Props {
  articles: ArticleItem[];
}

export function SeriesArticleList({ articles }: Props) {
  const { user } = useAuth();
  const [lockedArticle, setLockedArticle] = useState<ArticleItem['article'] | null>(null);

  // Member status unknown at this point (no server-side data passed).
  // We detect it via user token presence. For a more accurate check the
  // article page itself will enforce the paywall anyway.
  const isLoggedIn = !!user;

  return (
    <>
      <div className="space-y-3">
        {articles.map((item, index) => {
          const article = item.article;
          const isPremium = article.visibility === 'members_only';

          if (isPremium && !isLoggedIn) {
            // Non-logged-in user: show locked card, click opens subscribe modal
            return (
              <button
                key={article.id}
                onClick={() => setLockedArticle(article)}
                className="group flex w-full cursor-pointer items-start gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:bg-muted/30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-base font-semibold text-foreground group-hover:underline">
                      {article.title}
                    </h2>
                    <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-label="Konten premium" />
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
                    {article.readingTime && <span>{article.readingTime} menit baca</span>}
                  </div>
                </div>

                {article.coverImageUrl && (
                  <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg sm:block">
                    <Image
                      src={article.coverImageUrl}
                      alt={article.title}
                      fill
                      className="object-cover opacity-70"
                      sizes="96px"
                    />
                  </div>
                )}
              </button>
            );
          }

          // Free article OR logged-in user: navigate directly
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
                  {isPremium && (
                    <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-label="Konten premium" />
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
                  {article.readingTime && <span>{article.readingTime} menit baca</span>}
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

      {/* Subscribe Modal — muncul saat klik artikel premium */}
      <Dialog open={!!lockedArticle} onOpenChange={(open) => !open && setLockedArticle(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Konten Premium</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Artikel ini khusus untuk member berlangganan.
            </DialogDescription>
          </DialogHeader>

          {lockedArticle && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="font-serif text-base font-semibold text-foreground">
                  {lockedArticle.title}
                </p>
                {lockedArticle.excerpt && (
                  <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">
                    {lockedArticle.excerpt}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  onClick={() =>
                    (window.location.href = `/subscribe?next=${encodeURIComponent(`/${lockedArticle.slug}`)}`)
                  }
                >
                  Berlangganan untuk membaca
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() =>
                    (window.location.href = `/login?next=${encodeURIComponent(`/${lockedArticle.slug}`)}`)
                  }
                >
                  Sudah punya akun? Masuk
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
