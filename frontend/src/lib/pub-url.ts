export function pubUrl(publicationSlug: string, path: string): string {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    return `/${publicationSlug}${path.startsWith('/') ? path : '/' + path}`;
  }
  return path;
}
