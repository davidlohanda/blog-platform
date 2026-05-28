import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
  experimental: {
    // dynamicIO enables 'use cache' directive — required for Next.js 16 caching model
    // @ts-expect-error dynamicIO is available in Next.js 16 but not yet in type definitions
    dynamicIO: true,
  },
};

export default nextConfig;
