import { NextRequest, NextResponse } from 'next/server';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'lentera.id';
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'lentera.id';
const LOCAL_DOMAIN = 'lvh.me';

const PROTECTED_PREFIXES = ['/admin'];
const AUTH_EXCLUSIONS = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthExclusion(pathname: string): boolean {
  return AUTH_EXCLUSIONS.some((p) => pathname === p || pathname.startsWith(`${p}?`));
}

export function proxy(req: NextRequest): NextResponse {
  const hostname = req.headers.get('host') ?? '';
  const host = hostname.replace(/:.*$/, '');
  const { pathname } = req.nextUrl;

  // Auth guard: redirect to /admin/login if cookie missing on protected routes
  if (isProtected(pathname) && !isAuthExclusion(pathname) && !req.cookies.has('refreshToken')) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  // 1. Root domain (lentera.id or localhost) → platform, pass through
  const isRootPlatform = host === ROOT_DOMAIN || host === 'localhost';
  if (isRootPlatform) {
    return NextResponse.next();
  }

  // 2. Subdomain: slug.lvh.me (local) or slug.lentera.id (prod)
  const isLocalSubdomain = host.endsWith(`.${LOCAL_DOMAIN}`);
  const isProdSubdomain = host.endsWith(`.${BASE_DOMAIN}`);

  if (isLocalSubdomain || isProdSubdomain) {
    const suffix = isLocalSubdomain ? LOCAL_DOMAIN : BASE_DOMAIN;
    const slug = host.replace(`.${suffix}`, '');
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-publication-slug', slug);

    // Rewrite /admin/* → /pub-admin/admin/* for publication staff space
    if (pathname.startsWith('/admin')) {
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = '/pub-admin' + pathname;
      return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    }

    // Rewrite / → /pub-home for publication homepage
    if (pathname === '/') {
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = '/pub-home';
      return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 3. Custom domain → forward host for lookup
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-publication-host', host);
  return NextResponse.next({ request: { headers: requestHeaders } });
}
