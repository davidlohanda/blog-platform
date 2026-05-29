import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { PublicArticle } from '@/lib/pub-data';

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function AuthorAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={20}
        height={20}
        className="rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold">
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

interface ArticleCardProps {
  article: PublicArticle;
  featured?: boolean;
  compact?: boolean;
}

export function ArticleCard({ article, featured = false, compact = false }: ArticleCardProps) {
  const isPremium = article.visibility === 'members_only';
  const date = formatDate(article.publishedAt);
  const firstTag = article.tags[0]?.tag;

  if (featured) {
    return (
      <Link
        href={`/${article.slug}`}
        className="grid items-center gap-8 text-inherit no-underline md:grid-cols-[1.3fr_1fr]"
      >
        {/* Cover */}
        <div className="overflow-hidden rounded-xl bg-muted">
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              width={800}
              height={440}
              className="aspect-[16/9] w-full object-cover"
            />
          ) : (
            <div className="aspect-[16/9] w-full bg-muted" />
          )}
        </div>
        {/* Meta */}
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {firstTag && <Badge variant="secondary">{firstTag.name}</Badge>}
            {isPremium && (
              <Badge className="bg-foreground/10 text-foreground text-[10px] font-semibold">
                PREMIUM
              </Badge>
            )}
          </div>
          <h2 className="mb-3 font-heading text-3xl font-semibold leading-tight tracking-tight">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mb-4 text-base leading-relaxed text-muted-foreground line-clamp-3">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AuthorAvatar name={article.author.name} avatarUrl={article.author.avatarUrl} />
            <span className="font-medium text-foreground">{article.author.name}</span>
            <span>·</span>
            <span>{date}</span>
            {article.readingTime && (
              <>
                <span>·</span>
                <span>{article.readingTime} mnt baca</span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/${article.slug}`} className="block text-inherit no-underline">
      <div className="mb-3 overflow-hidden rounded-lg bg-muted">
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            width={400}
            height={compact ? 140 : 200}
            className={`w-full object-cover ${compact ? 'aspect-[16/9]' : 'aspect-video'}`}
          />
        ) : (
          <div className={`w-full bg-muted ${compact ? 'aspect-[16/9]' : 'aspect-video'}`} />
        )}
      </div>
      <div className="mb-2 flex flex-wrap gap-2">
        {firstTag && <Badge variant="secondary">{firstTag.name}</Badge>}
        {isPremium && (
          <Badge className="bg-foreground/10 text-foreground text-[10px] font-semibold">
            PREMIUM
          </Badge>
        )}
      </div>
      <h3
        className={`mb-2 font-heading font-semibold leading-snug tracking-tight ${compact ? 'text-lg' : 'text-xl'}`}
      >
        {article.title}
      </h3>
      {article.excerpt && (
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
      )}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <AuthorAvatar name={article.author.name} avatarUrl={article.author.avatarUrl} />
        <span>{article.author.name}</span>
        {article.readingTime && (
          <>
            <span>·</span>
            <span>{article.readingTime} mnt</span>
          </>
        )}
      </div>
    </Link>
  );
}
