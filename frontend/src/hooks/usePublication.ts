'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

interface Publication {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  customDomain: string | null;
}

export function usePublication() {
  const router = useRouter();
  const [pub, setPub] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{ data: Publication[] }>('/publications/mine')
      .then(({ data }) => {
        if (cancelled) return;
        if (data.data[0]) {
          setPub(data.data[0]);
        } else {
          // No publication — redirect to onboarding
          router.replace('/onboarding');
        }
      })
      .catch(() => {
        // Auth error — proxy.ts will handle redirect to /login
        // Other errors: let loading stop so page can show fallback
        if (!cancelled) setLoading(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [router]);

  return { pub, loading };
}
