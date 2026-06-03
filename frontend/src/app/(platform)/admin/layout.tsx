'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

const AUTH_PATHS = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];

export default function PlatformAdminLayout({ children }: { children: ReactNode }) {
  const { accessToken, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '?'));

  useEffect(() => {
    if (isAuthPage) return;
    if (!accessToken || user?.role !== 'platform_admin') {
      router.replace('/admin/login');
    }
  }, [accessToken, user, isAuthPage, router]);

  if (isAuthPage) return <>{children}</>;
  if (!accessToken || user?.role !== 'platform_admin') return null;

  return <>{children}</>;
}
