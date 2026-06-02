import Link from 'next/link';

interface SeriesArticleItem {
  orderIndex: number;
  article: { id: string; title: string; slug: string; status: string };
}

interface Props {
  seriesTitle: string;
  seriesSlug: string;
  currentSlug: string;
  articles: SeriesArticleItem[];
}

export function SeriesNav({ seriesTitle, seriesSlug, currentSlug, articles }: Props) {
  const published = articles.filter((a) => a.article.status === 'published');
  const currentIndex = published.findIndex((a) => a.article.slug === currentSlug);
  const prev = currentIndex > 0 ? published[currentIndex - 1] : null;
  const next = currentIndex < published.length - 1 ? published[currentIndex + 1] : null;
  const position = currentIndex >= 0 ? currentIndex + 1 : null;

  return (
    <div className="mt-12 rounded-xl border border-border bg-muted/30 p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
            <svg
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 5h11M6 10h11M6 15h11" />
              <circle cx="3" cy="5" r="1" />
              <circle cx="3" cy="10" r="1" />
              <circle cx="3" cy="15" r="1" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Bagian dari series
            </div>
            <Link
              href={`/series/${seriesSlug}`}
              className="font-heading text-base font-semibold text-foreground hover:underline"
            >
              {seriesTitle}
            </Link>
          </div>
        </div>
        {position && (
          <span className="font-mono text-xs text-muted-foreground">
            {position} / {published.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {prev ? (
          <Link
            href={`/${prev.article.slug}`}
            className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3 text-sm transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <svg
                width="10"
                height="10"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 10H4m4-4l-4 4 4 4" />
              </svg>
              Bagian sebelumnya
            </span>
            <span className="font-heading text-sm font-medium leading-snug">
              {prev.article.title}
            </span>
          </Link>
        ) : (
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3 opacity-40">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Bagian sebelumnya
            </span>
            <span className="font-heading text-sm italic text-muted-foreground">
              Ini bagian pertama
            </span>
          </div>
        )}

        {next ? (
          <Link
            href={`/${next.article.slug}`}
            className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3 text-right text-sm transition-colors hover:bg-muted"
          >
            <span className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Bagian berikutnya
              <svg
                width="10"
                height="10"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 10h12m-4-4l4 4-4 4" />
              </svg>
            </span>
            <span className="font-heading text-sm font-medium leading-snug">
              {next.article.title}
            </span>
          </Link>
        ) : (
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3 text-right opacity-40">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Bagian berikutnya
            </span>
            <span className="font-heading text-sm italic text-muted-foreground">
              Ini bagian terakhir
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
