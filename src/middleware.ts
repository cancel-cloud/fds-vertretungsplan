import { NextRequest, NextResponse } from 'next/server';

const isProd = process.env.NODE_ENV === 'production';
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || 'https://eu.i.posthog.com';
const posthogAssetsHost = posthogHost.includes('us.i.posthog.com')
  ? 'https://us-assets.i.posthog.com'
  : 'https://eu-assets.i.posthog.com';
const vercelScriptsHost = 'https://va.vercel-scripts.com';
const vercelInsightsHost = 'https://vitals.vercel-insights.com';

const buildCsp = (nonce: string) => {
  const scriptSrc = ["'self'", `'nonce-${nonce}'`];
  if (!isProd) {
    scriptSrc.push("'unsafe-eval'");
  }

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `script-src ${scriptSrc.join(' ')}`,
    `script-src-elem ${scriptSrc.join(' ')} ${vercelScriptsHost}`,
    "style-src 'self' 'unsafe-inline'",
    `connect-src 'self' https://eu.posthog.com ${posthogHost} ${posthogAssetsHost} ${vercelInsightsHost} ${vercelScriptsHost}`,
  ];

  if (isProd) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
};

export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('x-nonce', nonce);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
