type HeaderValue = string | string[] | undefined;
type HeaderRecord = Record<string, HeaderValue>;

type HeadersLike =
  | Headers
  | {
      get?: (name: string) => string | null | undefined;
      [key: string]: unknown;
    }
  | HeaderRecord
  | undefined
  | null;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface ConsumeRateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}

export interface ConsumeRateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
}

const RATE_LIMIT_MAX_ENTRIES = 10_000;
const rateLimitStore = new Map<string, RateLimitEntry>();

const normalizeHeaderName = (name: string): string => name.trim().toLowerCase();

const readRecordHeader = (record: HeaderRecord, name: string): string | null => {
  const lowerName = normalizeHeaderName(name);
  const direct = record[name];
  const lower = record[lowerName];
  const value = direct ?? lower;
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  if (typeof value === 'string') {
    return value;
  }
  return null;
};

export const getHeaderValue = (headers: HeadersLike, name: string): string | null => {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(name);
  }

  if (typeof headers.get === 'function') {
    const fromGet = headers.get(name);
    if (typeof fromGet === 'string') {
      return fromGet;
    }
    if (fromGet === null) {
      return null;
    }
  }

  return readRecordHeader(headers as HeaderRecord, name);
};

export const resolveClientIp = (headers: HeadersLike): string => {
  const forwardedFor = getHeaderValue(headers, 'x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = getHeaderValue(headers, 'x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = getHeaderValue(headers, 'cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }

  return 'unknown';
};

const pruneRateLimitStore = (now: number) => {
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key);
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
};

export const consumeRateLimit = (options: ConsumeRateLimitOptions): ConsumeRateLimitResult => {
  const now = options.now ?? Date.now();
  const key = options.key.trim();
  if (!key) {
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: Math.max(0, options.limit - 1),
    };
  }

  pruneRateLimitStore(now);

  const current = rateLimitStore.get(key);
  if (!current || now > current.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: Math.max(0, options.limit - 1),
    };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  current.count += 1;
  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(0, options.limit - current.count),
  };
};

export const resetRateLimit = (key: string): void => {
  rateLimitStore.delete(key);
};

export const __resetRateLimitStoreForTests = (): void => {
  rateLimitStore.clear();
};
