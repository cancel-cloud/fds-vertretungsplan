import { NextRequest, NextResponse } from 'next/server';
import {
  SubstitutionApiResponse,
  WebUntisResponse,
} from '@/types';
import { captureServerEvent } from '@/lib/analytics/posthog-server';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { sanitizeDeviceId } from '@/lib/analytics/device-id';
import {
  buildSubstitutionUrl,
  normalizeDateParam,
  resolveBaseUrl,
  resolveSchoolName,
} from '@/app/api/substitutions/route-utils';
import {
  DEMO_RANGE_END_NUMBER,
  DEMO_RANGE_START_NUMBER,
  isDemoDateAllowed,
  isDemoMode,
} from '@/lib/demo-config';
import { buildDemoDatasetMissingMessage, getDemoRowsForDate, getStoredDemoDataset } from '@/lib/demo-substitutions';
import {
  buildUntisRequestPayload,
  requestUntisSubstitutionData,
  UntisUpstreamError,
} from '@/lib/untis-client';

const META_RESPONSE_MESSAGE = 'No substitution data found. Only configuration returned.';
const RESPONSE_CACHE_TTL_MS = 30_000;
const RESPONSE_CACHE_STALE_IF_ERROR_TTL_MS = 30 * 60 * 1000;
const RESPONSE_CACHE_MAX_AGE_SECONDS = Math.floor(RESPONSE_CACHE_TTL_MS / 1000);
const RESPONSE_CACHE_SWR_SECONDS = 60;
const RESPONSE_CACHE_MAX_ENTRIES = 200;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_MAX_ENTRIES = 1000;

// Best-effort in-memory controls for serverless instances.
// State is not durable across cold starts.
const responseCache = new Map<string, { timestamp: number; data: SubstitutionApiResponse }>();
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

function getDistinctId(req: NextRequest): string {
  const incoming = sanitizeDeviceId(req.headers.get('x-device-id'));
  return incoming ?? 'api-anonymous';
}

function pruneRateLimitStore(now: number) {
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(ip);
    }
  }

  if (rateLimitStore.size <= RATE_LIMIT_MAX_ENTRIES) {
    return;
  }

  const entries = [...rateLimitStore.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
  const overflow = rateLimitStore.size - RATE_LIMIT_MAX_ENTRIES;
  for (let index = 0; index < overflow; index += 1) {
    rateLimitStore.delete(entries[index][0]);
  }
}

function pruneResponseCache(now: number) {
  for (const [key, entry] of responseCache.entries()) {
    if (now - entry.timestamp > RESPONSE_CACHE_STALE_IF_ERROR_TTL_MS) {
      responseCache.delete(key);
    }
  }

  if (responseCache.size <= RESPONSE_CACHE_MAX_ENTRIES) {
    return;
  }

  const entries = [...responseCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
  const overflow = responseCache.size - RESPONSE_CACHE_MAX_ENTRIES;

  for (let index = 0; index < overflow; index += 1) {
    responseCache.delete(entries[index][0]);
  }
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

const cacheControlHeader = `public, max-age=${RESPONSE_CACHE_MAX_AGE_SECONDS}, s-maxage=${RESPONSE_CACHE_MAX_AGE_SECONDS}, stale-while-revalidate=${RESPONSE_CACHE_SWR_SECONDS}`;
function hasSubstitutionPayload(data: unknown): data is WebUntisResponse {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const payload = (data as WebUntisResponse).payload;
  return Boolean(payload && typeof payload === 'object' && Array.isArray(payload.rows));
}

export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  const distinctId = getDistinctId(req);
  const clientIp = getClientIp(req);

  pruneRateLimitStore(startedAt);
  pruneResponseCache(startedAt);

  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    void captureServerEvent(ANALYTICS_EVENTS.API_SUBSTITUTIONS_RATE_LIMITED, distinctId, {
      retry_after_seconds: rateLimit.retryAfterSeconds,
      ip_hash_source: clientIp !== 'unknown',
    });

    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte versuchen Sie es in Kürze erneut.' },
      {
        status: 429,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': rateLimit.retryAfterSeconds.toString(),
        },
      }
    );
  }

  try {
    const { numeric } = normalizeDateParam(
      req.nextUrl.searchParams.get('date'),
      req.nextUrl.searchParams.get('dateOffset')
    );

    if (isDemoMode()) {
      if (!isDemoDateAllowed(numeric)) {
        return NextResponse.json(
          {
            error: `Demo-Modus erlaubt nur Daten zwischen ${DEMO_RANGE_START_NUMBER} und ${DEMO_RANGE_END_NUMBER}.`,
          },
          {
            status: 400,
            headers: {
              'Cache-Control': 'no-store',
            },
          }
        );
      }

      const cacheKey = `demo:${numeric}`;
      const cached = responseCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < RESPONSE_CACHE_TTL_MS) {
        return NextResponse.json(cached.data, {
          headers: {
            'Cache-Control': cacheControlHeader,
          },
        });
      }

      const dataset = await getStoredDemoDataset();
      if (!dataset) {
        const metaPayload: SubstitutionApiResponse = {
          type: 'meta',
          date: numeric,
          schoolName: 'demo-mode',
          message: buildDemoDatasetMissingMessage(),
        };

        responseCache.set(cacheKey, { timestamp: Date.now(), data: metaPayload });
        pruneResponseCache(Date.now());

        return NextResponse.json(metaPayload, {
          headers: {
            'Cache-Control': cacheControlHeader,
          },
        });
      }

      const responsePayload: SubstitutionApiResponse = {
        type: 'substitution',
        date: numeric,
        rows: getDemoRowsForDate(dataset, numeric),
        lastUpdate: dataset.generatedAt,
      };

      responseCache.set(cacheKey, { timestamp: Date.now(), data: responsePayload });
      pruneResponseCache(Date.now());

      return NextResponse.json(responsePayload, {
        headers: {
          'Cache-Control': cacheControlHeader,
        },
      });
    }

    const schoolName = resolveSchoolName();
    const baseUrl = resolveBaseUrl(schoolName);
    const substitutionUrl = buildSubstitutionUrl(baseUrl, schoolName);

    const cacheKey = `${schoolName}:${numeric}`;
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < RESPONSE_CACHE_TTL_MS) {
      void captureServerEvent(ANALYTICS_EVENTS.API_SUBSTITUTIONS_CACHE_HIT, distinctId, {
        date: numeric,
        duration_ms: Date.now() - startedAt,
      });

      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': cacheControlHeader,
        },
      });
    }

    let rawData: WebUntisResponse;
    try {
      rawData = await requestUntisSubstitutionData(substitutionUrl, buildUntisRequestPayload(numeric, schoolName));
    } catch (upstreamError) {
      const staleCached = responseCache.get(cacheKey);
      if (staleCached) {
        console.warn('Serving stale substitution cache after upstream failure', {
          date: numeric,
        });

        return NextResponse.json(staleCached.data, {
          headers: {
            'Cache-Control': 'public, max-age=0, s-maxage=0, stale-while-revalidate=60',
            'X-Data-Source': 'stale-cache',
          },
        });
      }

      throw upstreamError;
    }

    if (hasSubstitutionPayload(rawData)) {
      const payloadData = rawData.payload!;
      const responsePayload: SubstitutionApiResponse = {
        type: 'substitution',
        date: payloadData.date ?? numeric,
        rows: payloadData.rows ?? [],
        lastUpdate: payloadData.lastUpdate ?? null,
      };

      responseCache.set(cacheKey, { timestamp: Date.now(), data: responsePayload });
      pruneResponseCache(Date.now());

      void captureServerEvent(ANALYTICS_EVENTS.API_SUBSTITUTIONS_SUCCESS, distinctId, {
        date: payloadData.date ?? numeric,
        row_count: responsePayload.rows.length,
        duration_ms: Date.now() - startedAt,
      });

      return NextResponse.json(responsePayload, {
        headers: {
          'Cache-Control': cacheControlHeader,
        },
      });
    }

    console.warn('WebUntis returned metadata without substitution payload', {
      date: numeric,
    });

    const responsePayload: SubstitutionApiResponse = {
      type: 'meta',
      date: numeric,
      schoolName,
      message: META_RESPONSE_MESSAGE,
    };

    responseCache.set(cacheKey, { timestamp: Date.now(), data: responsePayload });
    pruneResponseCache(Date.now());

    void captureServerEvent(ANALYTICS_EVENTS.API_SUBSTITUTIONS_META, distinctId, {
      date: numeric,
      duration_ms: Date.now() - startedAt,
    });

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': cacheControlHeader,
      },
    });
  } catch (error) {
    console.error('Failed to fetch WebUntis substitution data', error);

    void captureServerEvent(ANALYTICS_EVENTS.API_SUBSTITUTIONS_ERROR, distinctId, {
      duration_ms: Date.now() - startedAt,
      message_length: error instanceof Error ? error.message.length : 0,
    });

    const isUpstreamUnavailable =
      error instanceof UntisUpstreamError && (error.retryable || error.status === 503 || error.status === 504);

    return NextResponse.json(
      {
        error: isUpstreamUnavailable
          ? 'Vertretungsdaten sind aktuell nicht erreichbar. Bitte versuche es in ein paar Minuten erneut.'
          : 'Fehler beim Laden der Vertretungen. Bitte versuchen Sie es später erneut.',
      },
      {
        status: isUpstreamUnavailable ? 503 : 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
