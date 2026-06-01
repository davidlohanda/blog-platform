import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cacheComponents: true as any,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    // Platform routes that must never be treated as publication slugs.
    // Mirrors PLATFORM_ROUTES in proxy.ts.
    const platformSlugExclude =
      'admin|dashboard|me|login|register|forgot-password|reset-password|' +
      'verify-email|accept-invite|onboarding|payment|subscribe|suspended|auth';

    return {
      // beforeFiles: runs after proxy, before file-system routing.
      // These rules strip the publication slug prefix from localhost dev URLs
      // so that Next.js routes to the correct page file.
      // They are gated to localhost:3000 only, leaving production unaffected.
      beforeFiles: [
        // /[slug]/[rest...] → /[rest...]
        {
          source: `/:pubSlug((?!${platformSlugExclude})[^/]+)/:rest+`,
          has: [{ type: 'host', value: 'localhost:3000' }],
          destination: '/:rest*',
        },
        // /[slug] → /  (publication homepage)
        {
          source: `/:pubSlug((?!${platformSlugExclude})[^/]+)`,
          has: [{ type: 'host', value: 'localhost:3000' }],
          destination: '/',
        },
      ],
    };
  },
};

export default nextConfig;
