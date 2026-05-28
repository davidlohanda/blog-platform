// Logic lives in proxy.ts per project convention.
// config must be defined inline — Next.js can't statically parse re-exported config objects.
export { default } from './proxy';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
