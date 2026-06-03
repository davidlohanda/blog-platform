'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Publication } from '@/lib/pub-data';

interface PublicationContextValue {
  slug: string;
  publication: Publication | null;
}

const PublicationContext = createContext<PublicationContextValue>({
  slug: '',
  publication: null,
});

export function PublicationProvider({
  slug,
  publication,
  children,
}: {
  slug: string;
  publication: Publication | null;
  children: ReactNode;
}) {
  return (
    <PublicationContext.Provider value={{ slug, publication }}>
      {children}
    </PublicationContext.Provider>
  );
}

export function usePublicationContext(): PublicationContextValue {
  return useContext(PublicationContext);
}

export function usePublicationSlug(): string {
  return useContext(PublicationContext).slug;
}
