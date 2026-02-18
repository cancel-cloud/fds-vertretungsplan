import { NextRequest, NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/demo-config';
import { getHeaderValue } from '@/lib/security/rate-limit';

const SAME_ORIGIN_ERROR = 'Ungültige Request-Herkunft.';

const normalizeHeaderHost = (value: string | null): string | null => {
  if (!value) {
    return null;
  }
  const host = value.split(',')[0]?.trim().toLowerCase();
  return host && host.length > 0 ? host : null;
};

const buildOrigin = (protocol: string, host: string): string => {
  const normalizedProtocol = protocol === 'http' || protocol === 'https' ? protocol : 'https';
  return `${normalizedProtocol}://${host}`;
};

const extractOrigin = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
};

const deriveAllowedOrigins = (request: Request | NextRequest): Set<string> => {
  const origins = new Set<string>();
  origins.add(new URL(request.url).origin.toLowerCase());

  const forwardedHost = normalizeHeaderHost(getHeaderValue(request.headers, 'x-forwarded-host'));
  const forwardedProtoRaw = getHeaderValue(request.headers, 'x-forwarded-proto');
  const forwardedProto = forwardedProtoRaw?.split(',')[0]?.trim().toLowerCase() ?? 'https';
  if (forwardedHost) {
    origins.add(buildOrigin(forwardedProto, forwardedHost));
  }

  const host = normalizeHeaderHost(getHeaderValue(request.headers, 'host'));
  if (host) {
    origins.add(buildOrigin(forwardedProto, host));
  }

  return origins;
};

const shouldEnforceSameOrigin = (): boolean => process.env.NODE_ENV === 'production' && !isDemoMode();

export const enforceSameOrigin = (request: Request | NextRequest): NextResponse | null => {
  if (!shouldEnforceSameOrigin()) {
    return null;
  }

  const allowedOrigins = deriveAllowedOrigins(request);
  const originHeader = extractOrigin(getHeaderValue(request.headers, 'origin'));
  if (originHeader && allowedOrigins.has(originHeader)) {
    return null;
  }

  const refererHeader = extractOrigin(getHeaderValue(request.headers, 'referer'));
  if (refererHeader && allowedOrigins.has(refererHeader)) {
    return null;
  }

  return NextResponse.json({ error: SAME_ORIGIN_ERROR }, { status: 403 });
};
