'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function DashboardGuardLayout({ children }: { children: ReactNode }) {
  const { accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.replace('/admin/login');
    }
  }, [accessToken, router]);

  if (!accessToken) return null;

  return <>{children}</>;
}
