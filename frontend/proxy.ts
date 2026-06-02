import { NextRequest, NextResponse } from 'next/server';

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'app.lentera.id';
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'lentera.id';
const LOCAL_DOMAIN = 'lentera.local';

const PROTECTED_PREFIXES = ['/admin', '/dashboard', '/me'];

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function proxy(req: NextRequest): NextResponse {
  const hostname = req.headers.get('host') ?? '';
  const host = hostname.replace(/:.*$/, '');
  const { pathname } = req.nextUrl;

  // Auth guard: redirect to /login if cookie missing
  if (isProtected(pathname) && !req.cookies.has('refreshToken')) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  // Platform app domain → pass through
  if (host === APP_DOMAIN) {
    return NextResponse.next();
  }

  // Subdomain: slug.lentera.local or slug.lentera.id
  const isLocalSubdomain = host.endsWith(`.${LOCAL_DOMAIN}`);
  const isProdSubdomain = host.endsWith(`.${BASE_DOMAIN}`);

  if (isLocalSubdomain || isProdSubdomain) {
    const suffix = isLocalSubdomain ? LOCAL_DOMAIN : BASE_DOMAIN;
    const slug = host.replace(`.${suffix}`, '');
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-publication-slug', slug);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Custom domain → forward host for lookup
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-publication-host', host);
  return NextResponse.next({ request: { headers: requestHeaders } });
}
