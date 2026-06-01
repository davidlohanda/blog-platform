'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api/client';
import type { PublicationRole } from '@/hooks/usePublication';

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
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ROLE_LABELS: Record<PublicationRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  author: 'Author',
};

function useMyPublicationRole() {
  const [role, setRole] = useState<PublicationRole | null>(null);
  useEffect(() => {
    apiClient
      .get<{ data: Array<{ role: PublicationRole }> }>('/publications/mine')
      .then(({ data }) => {
        const r = data.data[0]?.role;
        if (r) setRole(r);
      })
      .catch(() => {});
  }, []);
  return role;
}

export function DashboardShell({
  children,
  title,
  subtitle,
  action,
  publicationName = 'Lentera',
  publicationDomain,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { isImpersonation, impersonatedUserName, clearAuth, setToken } = useAuthStore();
  const myRole = useMyPublicationRole();

  async function exitImpersonation() {
    try {
      // Refresh will use admin's refreshToken cookie to restore admin session
      const { data } = await apiClient.post<{ data: { accessToken: string; user: { id: string; email: string; name: string; role: string; avatarUrl: string | null; emailVerifiedAt: string | null } } }>(
        '/auth/refresh',
      );
      setToken(data.data.accessToken);
      router.push('/admin/dashboard');
    } catch {
      clearAuth();
      router.push('/login');
    }
  }

  const isAuthor = myRole === 'author';

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Impersonation banner */}
      {isImpersonation && (
        <div className="flex shrink-0 items-center justify-between bg-amber-400 px-6 py-2 text-sm font-medium text-amber-950">
          <span>
            ⚡ Mode impersonasi — kamu sedang masuk sebagai{' '}
            <strong>{impersonatedUserName}</strong>. Beberapa aksi dinonaktifkan.
          </span>
          <button
            type="button"
            onClick={() => { void exitImpersonation(); }}
            className="rounded bg-amber-900/20 px-3 py-1 text-xs font-semibold hover:bg-amber-900/30 transition-colors"
          >
            Kembali ke Admin →
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
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
          {/* Publication section */}
          <div className="mb-4">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Publication
            </p>
            {[
              {
                href: '/dashboard',
                label: 'Overview',
                icon: <NavIcon d="M1 1h5v5H1zM9 1h5v5H9zM1 9h5v5H1zM9 9h5v5H9z" />,
              },
              {
                href: '/dashboard/articles',
                label: 'Artikel',
                icon: <NavIcon d="M3 4h9M3 7.5h9M3 11h6" />,
              },
              {
                href: '/dashboard/series',
                label: 'Series',
                icon: <NavIcon d="M3 3h9M3 7h9M3 11h5" />,
              },
            ].map((item) => (
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

          {/* Audience section — hidden for author role */}
          {!isAuthor && (
            <div className="mb-4">
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Audience
              </p>
              {[
                {
                  href: '/dashboard/subscribers',
                  label: 'Subscriber',
                  icon: (
                    <NavIcon d="M10 11c0-2-1.3-3-2.5-3S5 9 5 11M7.5 5.5a2 2 0 100-4 2 2 0 000 4z" />
                  ),
                },
                {
                  href: '/dashboard/analytics',
                  label: 'Analytics',
                  icon: <NavIcon d="M1 11l3-4 3 2 3-5 3 3" />,
                },
              ].map((item) => (
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
          )}

          {/* Settings section */}
          <div className="mb-4">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Pengaturan
            </p>
            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                isActive('/dashboard/settings')
                  ? 'bg-background font-medium text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
              }`}
            >
              <NavIcon d="M7.5 5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM2 7.5h1M11 7.5h1M7.5 2v1M7.5 11v1" />
              Umum
            </Link>
          </div>
        </nav>

        {/* User footer */}
        <div className="flex items-center gap-2.5 border-t border-border px-3 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-border text-[11px] font-semibold text-foreground">
            {user?.name?.slice(0, 2).toUpperCase() ?? '??'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">{user?.name ?? '…'}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {myRole ? ROLE_LABELS[myRole] : '…'}
            </p>
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
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      </div>
    </div>
  );
}
