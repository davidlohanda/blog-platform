import { Suspense } from 'react';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { PublicationProvider } from '@/contexts/PublicationContext';
import { getPublicationBySlug } from '@/lib/pub-data';

// Async resolver lives inside <Suspense> so headers() doesn't block static generation
async function PublicationResolver({ children }: { children: ReactNode }) {
  const h = await headers();
  const slug = h.get('x-publication-slug') ?? '';

  if (!slug) {
    return <>{children}</>;
  }

  let publication = null;
  try {
    publication = await getPublicationBySlug(slug);
  } catch {
    notFound();
  }

  if (publication.status === 'suspended_hard' || publication.status === 'pending_deletion') {
    redirect('/suspended');
  }

  return (
    <PublicationProvider slug={slug} publication={publication}>
      {children}
    </PublicationProvider>
  );
}

export default function PublicationLayout({ children }: { children: ReactNode }) {
  return <Suspense>{children ? <PublicationResolver>{children}</PublicationResolver> : null}</Suspense>;
}
