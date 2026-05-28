import { NextRequest, NextResponse } from 'next/server';

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'app.lentera.id';
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'lentera.id';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export default function middleware(req: NextRequest): NextResponse {
  const hostname = req.headers.get('host') ?? '';
  const pathname = req.nextUrl.pathname;

  // Strip port for local dev
  const host = hostname.replace(/:.*$/, '');

  // Dashboard traffic — pass through without modification
  if (host === APP_DOMAIN || host === 'localhost') {
    return NextResponse.next();
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

  // Auth redirect — if protected route and no refresh token cookie, send to login
  const refreshToken = req.cookies.get('refreshToken');
  const protectedPaths = ['/dashboard', '/me'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !refreshToken) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}
