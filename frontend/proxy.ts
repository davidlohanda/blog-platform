import { NextRequest, NextResponse } from 'next/server';

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'app.lentera.id';
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'lentera.id';

// Platform-level first path segments — never treated as publication slugs
const PLATFORM_ROUTES = new Set([
  'admin',
  'dashboard',
  'me',
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'verify-email',
  'accept-invite',
  'onboarding',
  'payment',
  'subscribe',
  'suspended',
  'auth',
]);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export function proxy(req: NextRequest): NextResponse {
  const hostname = req.headers.get('host') ?? '';
  const pathname = req.nextUrl.pathname;

  // Strip port for local dev
  const host = hostname.replace(/:.*$/, '');

  // Platform app domain — pass through (no publication context)
  if (host === APP_DOMAIN) {
    return NextResponse.next();
  }

  // ── Localhost: path-based publication routing for dev ──────────────────────
  // localhost:3000                   → platform landing page (pass through)
  // localhost:3000/[slug]            → publication homepage
  // localhost:3000/[slug]/[article]  → publication article page
  // localhost:3000/[slug]/dashboard  → publication dashboard
  if (host === 'localhost') {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];

    // Root path ('/' has no segments) or known platform route → pass through
    if (!firstSegment || PLATFORM_ROUTES.has(firstSegment)) {
      return NextResponse.next();
    }

    // First segment is the publication slug; strip it and rewrite
    const slug = firstSegment;
    const rest = segments.slice(1);
    const newPath = rest.length > 0 ? `/${rest.join('/')}` : '/';

    const url = req.nextUrl.clone();
    url.pathname = newPath;

    // NextResponse.rewrite() forwards response headers set here to the
    // rewritten page as request headers (readable via next/headers).
    // This is different from NextResponse.next() where res.headers goes to browser.
    const res = NextResponse.rewrite(url);
    res.headers.set('x-publication-slug', slug);
    res.headers.set('x-publication-host', `${slug}.localhost`);
    return res;
  }

  // ── Subdomain: slug.lentera.id → extract slug and pass through ─────────────
  if (host.endsWith(`.${BASE_DOMAIN}`)) {
    const slug = host.replace(`.${BASE_DOMAIN}`, '');
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-publication-host', host);
    requestHeaders.set('x-publication-slug', slug);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // ── Custom domain — forward host as publication identifier ─────────────────
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-publication-host', host);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
