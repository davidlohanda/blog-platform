import { Suspense } from 'react';
import { GoogleCallbackHandler } from './GoogleCallbackHandler';

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Memproses login Google…</p>
        </div>
      }
    >
      <GoogleCallbackHandler />
    </Suspense>
  );
}
