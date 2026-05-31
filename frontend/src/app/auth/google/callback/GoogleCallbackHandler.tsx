'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, type AuthUser } from '@/store/authStore';
import { apiClient } from '@/lib/api/client';

export function GoogleCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get('access_token');
    const error = searchParams.get('error');

    if (error || !token) {
      router.replace('/login?error=oauth_failed');
      return;
    }

    apiClient
      .get<{ data: AuthUser }>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async ({ data }) => {
        setAuth(token, data.data);
        document.cookie = `user-role=${data.data.role}; path=/; SameSite=Lax; Max-Age=${30 * 24 * 3600}`;

        if (data.data.role === 'platform_admin') {
          router.replace('/admin/dashboard');
          return;
        }
        try {
          const pubRes = await apiClient.get<{ data: Array<unknown> }>('/publications/mine', {
            headers: { Authorization: `Bearer ${token}` },
          });
          router.replace((pubRes.data.data as Array<unknown>).length > 0 ? '/dashboard' : '/');
        } catch {
          router.replace('/dashboard');
        }
      })
      .catch(() => {
        router.replace('/login?error=oauth_failed');
      });
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Memproses login Google…</p>
    </div>
  );
}
