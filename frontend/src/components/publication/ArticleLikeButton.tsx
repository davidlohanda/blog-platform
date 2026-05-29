'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';

interface Props {
  pubId: string;
  articleId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function ArticleLikeButton({ pubId, articleId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    // Optimistic update
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    try {
      const res = await apiClient.post<{
        success: boolean;
        data: { liked: boolean; likesCount: number };
      }>(`/publications/${pubId}/articles/${articleId}/like`);
      setLiked(res.data.data.liked);
      setCount(res.data.data.likesCount);
    } catch {
      // Revert on error
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={`gap-1.5 ${liked ? 'text-foreground' : 'text-muted-foreground'}`}
      aria-label={liked ? 'Batal suka' : 'Suka artikel ini'}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 20 20"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 16.5s-6-3.5-6-8a3.5 3.5 0 0 1 6-2.4 3.5 3.5 0 0 1 6 2.4c0 4.5-6 8-6 8z" />
      </svg>
      <span>{count}</span>
    </Button>
  );
}
