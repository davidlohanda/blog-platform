import Link from 'next/link';
import Image from 'next/image';
import type { Publication } from '@/lib/pub-data';
import { pubUrl } from '@/lib/pub-url';

interface Props {
  pub: Publication;
  activePage?: 'home' | 'series' | 'about';
}

export function PublicationNavbar({ pub, activePage = 'home' }: Props) {
  const initial = pub.name.slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-6 px-4 md:px-8">
        {/* Logo */}
        <Link href={pubUrl(pub.slug, '/')} className="flex shrink-0 items-center gap-2">
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
            href={pubUrl(pub.slug, '/')}
            className={`transition-colors ${activePage === 'home' ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Beranda
          </Link>
          <Link
            href={pubUrl(pub.slug, '/series')}
            className={`transition-colors ${activePage === 'series' ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Series
          </Link>
          <Link
            href={pubUrl(pub.slug, '/about')}
            className={`transition-colors ${activePage === 'about' ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Tentang
          </Link>
        </nav>

        {/* CTA */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={pubUrl(pub.slug, '/login')}
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            Masuk
          </Link>
          <Link
            href={pubUrl(pub.slug, '/subscribe')}
            className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-foreground/90"
          >
            Berlangganan
          </Link>
        </div>
      </div>
    </header>
  );
}
