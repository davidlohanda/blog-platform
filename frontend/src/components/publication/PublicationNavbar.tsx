'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Publication } from '@/lib/pub-data';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  pub: Publication;
  activePage?: 'home' | 'series' | 'about';
}

export function PublicationNavbar({ pub, activePage = 'home' }: Props) {
  const initial = pub.name.slice(0, 1).toUpperCase();
  const { accessToken } = useAuthStore();
  const { logout } = useAuth();
  const isLoggedIn = !!accessToken;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-6 px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {pub.logoUrl ? (
            <Image
              src={pub.logoUrl}
              alt={pub.name}
              width={28}
              height={28}
              className="rounded"
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded bg-foreground font-heading text-sm font-semibold text-primary-foreground">
              {initial}
            </span>
          )}
          <span className="font-heading text-base font-semibold">{pub.name}</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-5 text-sm md:flex">
          <Link
            href="/"
            className={`transition-colors ${activePage === 'home' ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Beranda
          </Link>
          <Link
            href="/series"
            className={`transition-colors ${activePage === 'series' ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Series
          </Link>
          <Link
            href="/about"
            className={`transition-colors ${activePage === 'about' ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Tentang
          </Link>
        </nav>

        {/* CTA */}
        <div className="ml-auto flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/subscription"
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
              >
                Langganan
              </Link>
              <Link
                href="/settings"
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
              >
                Pengaturan
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
              >
                Masuk
              </Link>
              <Link
                href="/subscribe"
                className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground/90"
              >
                Berlangganan
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
