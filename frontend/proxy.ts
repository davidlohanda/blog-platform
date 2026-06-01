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

  const refreshToken = req.cookies.get('refreshToken');
  const userRole = req.cookies.get('user-role')?.value ?? '';

  // Protect /admin routes: only platform_admin may access
  if (pathname.startsWith('/admin')) {
    if (!refreshToken || userRole !== 'platform_admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Protect /dashboard and /me: must be logged in
  const protectedPaths = ['/dashboard', '/me'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected && !refreshToken) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Platform app domain — pass through (no publication context)
  if (host === APP_DOMAIN) {
    return NextResponse.next();
  }

  // Localhost: path-based publication routing for dev
  // localhost:3000/[slug]/... → strip slug prefix, set publication headers
  if (host === 'localhost') {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];

    // Root path or platform route — pass through
    if (!firstSegment || PLATFORM_ROUTES.has(firstSegment)) {
      return NextResponse.next();
    }

    // First segment is treated as the publication slug
    const slug = firstSegment;
    const rest = segments.slice(1);
    const newPath = rest.length > 0 ? `/${rest.join('/')}` : '/';

    const url = req.nextUrl.clone();
    url.pathname = newPath;

    const res = NextResponse.rewrite(url);
    res.headers.set('x-publication-slug', slug);
    res.headers.set('x-publication-host', `${slug}.localhost`);
    return res;
  }

  // Subdomain publication: slug.lentera.id → extract slug
  if (host.endsWith(`.${BASE_DOMAIN}`)) {
    const slug = host.replace(`.${BASE_DOMAIN}`, '');
    const res = NextResponse.next();
    res.headers.set('x-publication-host', host);
    res.headers.set('x-publication-slug', slug);
    return res;
  }

  // Custom domain — forward the full host as publication identifier
  const res = NextResponse.next();
  res.headers.set('x-publication-host', host);
  return res;
}
