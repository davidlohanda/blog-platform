'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type AuthUser } from '@/store/authStore';
import { apiClient } from '@/lib/api/client';

export function useAuth() {
  const { accessToken, user, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await apiClient.post<{ data: { accessToken: string; user: AuthUser } }>(
        '/auth/login',
        { email, password },
      );
      setAuth(data.data.accessToken, data.data.user);
      // Set role cookie for proxy-level routing (not security-critical; backend validates JWT)
      document.cookie = `user-role=${data.data.user.role}; path=/; SameSite=Lax; Max-Age=${30 * 24 * 3600}`;
      return data.data;
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearAuth();
      // Clear role cookie
      document.cookie = 'user-role=; path=/; Max-Age=0';
      router.push('/login');
    }
  }, [clearAuth, router]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { data } = await apiClient.post<{
        data: { message: string; user: Pick<AuthUser, 'id' | 'email' | 'name'> };
      }>('/auth/register', { name, email, password });
      return data.data;
    },
    [],
  );

  return {
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    login,
    logout,
    register,
  };
}
