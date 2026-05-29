'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface DashboardShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  publicationName?: string;
  publicationDomain?: string;
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_SECTIONS = [
  {
    label: 'Publication',
    items: [
      { href: '/dashboard', label: 'Overview', icon: <NavIcon d="M1 1h5v5H1zM9 1h5v5H9zM1 9h5v5H1zM9 9h5v5H9z" /> },
      { href: '/dashboard/articles', label: 'Artikel', icon: <NavIcon d="M3 4h9M3 7.5h9M3 11h6" /> },
      { href: '/dashboard/series', label: 'Series', icon: <NavIcon d="M3 3h9M3 7h9M3 11h5" /> },
    ],
  },
  {
    label: 'Audience',
    items: [
      { href: '/dashboard/subscribers', label: 'Subscriber', icon: <NavIcon d="M10 11c0-2-1.3-3-2.5-3S5 9 5 11M7.5 5.5a2 2 0 100-4 2 2 0 000 4z" /> },
      { href: '/dashboard/analytics', label: 'Analytics', icon: <NavIcon d="M1 11l3-4 3 2 3-5 3 3" /> },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { href: '/dashboard/settings', label: 'Umum', icon: <NavIcon d="M7.5 5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM2 7.5h1M11 7.5h1M7.5 2v1M7.5 11v1" /> },
    ],
  },
];

export function DashboardShell({
  children,
  title,
  subtitle,
  action,
  publicationName = 'Lentera',
  publicationDomain,
}: DashboardShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-muted">
        {/* Publication header */}
        <div className="flex items-center gap-2.5 border-b border-border px-3 py-3.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground font-serif text-sm font-semibold italic text-background">
            {publicationName.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{publicationName}</p>
            {publicationDomain && (
              <p className="truncate text-[11px] text-muted-foreground">{publicationDomain}</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {section.label}
              </p>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-background font-medium text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="flex items-center gap-2.5 border-t border-border px-3 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-border text-[11px] font-semibold text-foreground">
            {user?.name?.slice(0, 2).toUpperCase() ?? '??'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">{user?.name ?? '…'}</p>
            <p className="truncate text-[11px] text-muted-foreground">Owner</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-8 py-5">
          <div>
            <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
