'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api/client';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'unauthenticated';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        setStatus('unauthenticated');
        return;
      }
      if (!token) {
        setStatus('error');
        setMessage('Token undangan tidak ditemukan.');
        return;
      }

      setStatus('loading');
      apiClient
        .get<{ data: { message: string; publicationId: string } }>(
          `/auth/accept-invite?token=${token}`,
        )
        .then(({ data }) => {
          setStatus('success');
          setMessage(data.data.message);
        })
        .catch((err: unknown) => {
          const apiErr = err as { response?: { data?: { message?: string } } };
          setStatus('error');
          setMessage(
            apiErr?.response?.data?.message ??
              'Gagal menerima undangan. Token mungkin sudah kedaluwarsa.',
          );
        });
    }, 100);

    return () => clearTimeout(timer);
  }, [user, token]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Memproses undangan…</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    const redirect = encodeURIComponent(`/accept-invite?token=${token}`);
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="mb-2 text-xl font-semibold text-foreground">Login untuk melanjutkan</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Kamu perlu login atau membuat akun untuk menerima undangan ini.
          </p>
          <div className="flex flex-col gap-3">
            <Button className="w-full">
              <Link href={`/login?redirect=${redirect}`} className="w-full">
                Masuk
              </Link>
            </Button>
            <Button variant="outline" className="w-full">
              <Link href={`/register?redirect=${redirect}`} className="w-full">
                Buat akun baru
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <p className="mb-2 text-xl font-semibold text-foreground">Undangan tidak valid</p>
          <p className="mb-6 text-sm text-muted-foreground">{message}</p>
          <Button variant="outline" onClick={() => router.push('/')}>
            Kembali ke beranda
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-4 text-4xl">🎉</div>
        <h1 className="mb-2 text-xl font-semibold text-foreground">Berhasil bergabung!</h1>
        <p className="mb-6 text-sm text-muted-foreground">{message}</p>
        <Button onClick={() => router.push('/dashboard')}>Buka Dashboard</Button>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Memproses undangan…</p>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
