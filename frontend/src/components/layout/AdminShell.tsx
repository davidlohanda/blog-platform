'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AdminShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: <NavIcon d="M1 1h5v5H1zM9 1h5v5H9zM1 9h5v5H1zM9 9h5v5H9z" />,
  },
  {
    href: '/admin/publications',
    label: 'Publications',
    icon: <NavIcon d="M3 4h9M3 7.5h9M3 11h6" />,
  },
  {
    href: '/admin/invite',
    label: 'Invite Owner',
    icon: <NavIcon d="M7.5 1v13M1 7.5h13" />,
  },
];

export function AdminShell({ children, title, subtitle, action }: AdminShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-muted">
        {/* Platform header */}
        <div className="flex items-center gap-2.5 border-b border-border px-3 py-3.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground font-serif text-sm font-semibold italic text-background">
            L
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">Lentera Admin</p>
            <p className="truncate text-[11px] text-muted-foreground">Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Platform
          </p>
          {NAV_ITEMS.map((item) => (
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
        </nav>

        {/* User footer */}
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-border text-[11px] font-semibold text-foreground">
              {user?.name?.slice(0, 2).toUpperCase() ?? '??'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{user?.name ?? '…'}</p>
              <p className="truncate text-[11px] text-muted-foreground">Platform Admin</p>
            </div>
          </div>
          <button
            onClick={() => void logout()}
            className="mt-2 w-full rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-background/60 hover:text-foreground transition-colors"
          >
            Keluar
          </button>
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
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
