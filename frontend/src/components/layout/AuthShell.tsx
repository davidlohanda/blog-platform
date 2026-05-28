import type { ReactNode } from 'react';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left — brand panel (hidden on mobile) */}
      <div className="hidden flex-col border-r border-border bg-muted px-10 py-12 md:flex lg:px-14">
        <div className="mb-auto">
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            Lentera
          </span>
        </div>

        <div className="max-w-sm">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Catatan dari penulis
          </p>
          <blockquote className="font-serif text-2xl font-medium italic leading-snug text-foreground lg:text-[27px]">
            &ldquo;Kami tidak menulis untuk mengalahkan algoritma. Kami menulis untuk dibaca dengan
            teliti oleh seseorang yang juga sedang minum kopi.&rdquo;
          </blockquote>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-border" />
            <div>
              <p className="text-sm font-semibold text-foreground">Andi Pratama</p>
              <p className="text-xs text-muted-foreground">Co-founder · TechBites</p>
            </div>
          </div>
        </div>

        <p className="mt-auto pt-8 text-xs text-muted-foreground">© 2026 Lentera · Esai mingguan</p>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-col overflow-auto bg-background px-6 py-10 sm:px-10 md:px-12 lg:px-16">
        {/* Mobile-only logo */}
        <div className="mb-8 md:hidden">
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            Lentera
          </span>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <h1 className="mb-2 font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          )}
          {children}
        </div>

        {footer && (
          <div className="mx-auto mt-6 w-full max-w-sm text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
