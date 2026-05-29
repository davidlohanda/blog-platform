import { cacheLife, cacheTag } from 'next/cache';
import { serverFetch } from './api/server';

export interface Publication {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  customDomain: string | null;
  createdAt: string;
}

export interface PublicAuthor {
  id: string;
  role: 'owner' | 'author';
  joinedAt: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface PublicArticle {
  id: string;
  publicationId: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  status: string;
  visibility: 'free' | 'members_only';
  publishedAt: string | null;
  readingTime: number | null;
  viewsCount: number;
  likesCount: number;
  author: { id: string; name: string; avatarUrl: string | null };
  tags: Array<{ tag: { id: string; name: string; slug: string } }>;
}

export interface FullArticle extends PublicArticle {
  content: Record<string, unknown> | null;
  excerpt: string | null;
  coverImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
  };
  seriesLinks: Array<{
    orderIndex: number;
    series: {
      id: string;
      title: string;
      slug: string;
      _count?: { articles: number };
    };
  }>;
}

export interface SeriesWithArticles {
  id: string;
  title: string;
  slug: string;
  articles: Array<{
    orderIndex: number;
    article: {
      id: string;
      title: string;
      slug: string;
      status: string;
    };
  }>;
}

export async function getPublicationBySlug(slug: string): Promise<Publication> {
  'use cache';
  cacheTag(`pub:${slug}`);
  cacheLife('hours');
  const res = await serverFetch<{ success: true; data: Publication }>(
    `/publications/${slug}`,
  );
  return res.data;
}

export async function getPublicArticles(
  pubId: string,
  opts: { limit?: number; authorId?: string; tag?: string; cursor?: string } = {},
): Promise<{ data: PublicArticle[]; nextCursor: string | null; hasMore: boolean }> {
  'use cache';
  cacheTag(`articles:${pubId}`);
  cacheLife('minutes');
  const params = new URLSearchParams({ limit: String(opts.limit ?? 20) });
  if (opts.authorId) params.set('authorId', opts.authorId);
  if (opts.tag) params.set('tag', opts.tag);
  if (opts.cursor) params.set('cursor', opts.cursor);
  return serverFetch(`/publications/${pubId}/articles/public?${params}`);
}

export async function getPublicAuthors(pubId: string): Promise<PublicAuthor[]> {
  'use cache';
  cacheTag(`authors:${pubId}`);
  cacheLife('hours');
  const res = await serverFetch<{ success: true; data: PublicAuthor[] }>(
    `/publications/${pubId}/authors/public`,
  );
  return res.data;
}

// Fetches article for public reader (content gated for premium based on server-side auth)
export async function getPublicArticle(
  pubId: string,
  slug: string,
): Promise<FullArticle> {
  'use cache';
  cacheTag(`article:${pubId}:${slug}`);
  cacheLife('hours');
  const res = await serverFetch<{ success: true; data: FullArticle }>(
    `/publications/${pubId}/articles/read/${slug}`,
  );
  return res.data;
}

// Request-time fetch (no cache) — for premium articles with auth check
export async function getArticleWithAuth(
  pubId: string,
  slug: string,
): Promise<FullArticle> {
  const res = await serverFetch<{ success: true; data: FullArticle }>(
    `/publications/${pubId}/articles/read/${slug}`,
  );
  return res.data;
}

export async function getSeriesForArticle(
  pubId: string,
  seriesSlug: string,
): Promise<SeriesWithArticles> {
  'use cache';
  cacheTag(`series:${pubId}:${seriesSlug}`);
  cacheLife('hours');
  const res = await serverFetch<{ success: true; data: SeriesWithArticles }>(
    `/publications/${pubId}/series/${seriesSlug}`,
  );
  return res.data;
}
