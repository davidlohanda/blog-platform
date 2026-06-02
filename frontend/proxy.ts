import { NextRequest, NextResponse } from 'next/server';

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'app.lentera.id';
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'lentera.id';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export function proxy(req: NextRequest): NextResponse {
  const hostname = req.headers.get('host') ?? '';
  const host = hostname.replace(/:.*$/, '');

  // Platform app domain — pass through (no publication context)
  if (host === APP_DOMAIN) {
    return NextResponse.next();
  }

  // Subdomain: [slug].lentera.id → extract slug and forward as request header
  if (host.endsWith(`.${BASE_DOMAIN}`)) {
    const slug = host.replace(`.${BASE_DOMAIN}`, '');
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-publication-host', host);
    requestHeaders.set('x-publication-slug', slug);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Custom domain — forward host as publication identifier
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-publication-host', host);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
