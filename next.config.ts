import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';
const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter((value) => value.length > 0);

const securityHeaders = [
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins:
    isDev && allowedDevOrigins.length > 0
      ? allowedDevOrigins
      : isDev
        ? ['localhost', '*.localhost', '127.0.0.1', '*.local', '*.localcan.dev']
        : undefined,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || 'https://eu.i.posthog.com';
    const posthogAssetsHost = posthogHost.includes('us.i.posthog.com')
      ? 'https://us-assets.i.posthog.com'
      : 'https://eu-assets.i.posthog.com';

    return [
      {
        source: '/x7k9m2/static/:path*',
        destination: `${posthogAssetsHost}/static/:path*`,
      },
      {
        source: '/x7k9m2/:path*',
        destination: `${posthogHost}/:path*`,
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
