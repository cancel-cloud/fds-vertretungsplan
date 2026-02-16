import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const isProd = process.env.NODE_ENV === 'production';
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || 'https://eu.i.posthog.com';
const posthogAssetsHost = posthogHost.includes('us.i.posthog.com')
  ? 'https://us-assets.i.posthog.com'
  : 'https://eu-assets.i.posthog.com';
const vercelScriptsHost = 'https://va.vercel-scripts.com';
const vercelInsightsHost = 'https://vitals.vercel-insights.com';

const buildCsp = () => {
  const scriptSrc = ["'self'", "'unsafe-inline'", vercelScriptsHost];
  if (!isProd) {
    scriptSrc.push("'unsafe-eval'");
  }
  const connectSrc = isProd
    ? ["'self'", 'https://eu.posthog.com', posthogHost, posthogAssetsHost, vercelInsightsHost, vercelScriptsHost]
    : ['*', 'data:', 'blob:', 'ws:', 'wss:'];

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "img-src 'self' data: https:",
    "font-src 'self' data: https://r2cdn.perplexity.ai",
    "worker-src 'self' blob:",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    `connect-src ${connectSrc.join(' ')}`,
  ];

  if (isProd) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
};

const STUNDENPLAN_PUBLIC_PATHS = new Set(['/stundenplan/login', '/stundenplan/register']);
const normalizePathname = (pathname: string): string => {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
};

export async function middleware(req: NextRequest) {
  const csp = buildCsp();
  const pathname = req.nextUrl.pathname;
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname.startsWith('/stundenplan')) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
    });
    const isAuthenticated = Boolean(token);
    const isPublicStundenplanPath = STUNDENPLAN_PUBLIC_PATHS.has(normalizedPathname);

    if (!isAuthenticated && !isPublicStundenplanPath) {
      const url = req.nextUrl.clone();
      url.pathname = '/stundenplan/login';
      url.searchParams.set('next', normalizedPathname);
      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.headers.set('Content-Security-Policy', csp);
      return redirectResponse;
    }

    if (isAuthenticated && isPublicStundenplanPath) {
      const url = req.nextUrl.clone();
      url.pathname = '/stundenplan';
      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.headers.set('Content-Security-Policy', csp);
      return redirectResponse;
    }
  }

  const response = NextResponse.next();

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
