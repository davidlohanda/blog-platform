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
    // Skip if already processed — prevents double-rewrite when proxy re-runs on internal rewrites
    if (req.nextUrl.searchParams.has('__pub')) {
      return NextResponse.next();
    }

    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];

    if (!firstSegment || PLATFORM_ROUTES.has(firstSegment)) {
      return NextResponse.next();
    }

    // firstSegment adalah publication slug
    const slug = firstSegment;
    const newPathname = '/' + segments.slice(1).join('/') || '/';
    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = newPathname;
    rewriteUrl.search = '';
    rewriteUrl.searchParams.set('__pub', slug);
    const res = NextResponse.rewrite(rewriteUrl);
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
