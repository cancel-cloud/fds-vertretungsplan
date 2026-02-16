import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/analytics/posthog-server', () => ({
  captureServerEvent: vi.fn().mockResolvedValue(undefined),
}));

const getStoredDemoDatasetMock = vi.fn();

vi.mock('@/lib/demo-substitutions', () => ({
  getStoredDemoDataset: getStoredDemoDatasetMock,
  getDemoRowsForDate: (dataset: { days?: Record<string, unknown[]> }, dateNumber: number) =>
    dataset.days?.[String(dateNumber)] ?? [],
  buildDemoDatasetMissingMessage: () => 'Demo-Daten sind noch nicht erzeugt.',
}));

const originalEnv = { ...process.env };

describe('api/substitutions route', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.UNTIS_BASE_URL;
    delete process.env.UNTIS_SCHOOL;
    delete process.env.APP_MODE;
    getStoredDemoDatasetMock.mockResolvedValue(null);
  });

  it('validates UNTIS_BASE_URL domain and protocol', async () => {
    const { resolveBaseUrl } = await import('@/app/api/substitutions/route-utils');

    process.env.UNTIS_BASE_URL = 'http://example.com';
    expect(() => resolveBaseUrl('school')).toThrow('UNTIS_BASE_URL must use HTTPS');

    process.env.UNTIS_BASE_URL = 'https://example.com';
    expect(() => resolveBaseUrl('school')).toThrow('UNTIS_BASE_URL must target https://*.webuntis.com');
  });

  it('caches successful responses', async () => {
    const payload = {
      payload: {
        date: 20250210,
        rows: [
          {
            data: ['1', '07:45-08:30', '10A', 'MAT', 'A101', 'ABC', 'Entfall', ''],
            cssClasses: [],
            cellClasses: {},
            group: '10A',
          },
        ],
        lastUpdate: 'now',
      },
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);

    const { GET } = await import('@/app/api/substitutions/route');

    const req = new NextRequest('http://localhost/api/substitutions?date=20250210');
    const first = await GET(req);
    const second = await GET(req);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns meta response without raw upstream config', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ schoolName: 'test-school' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { GET } = await import('@/app/api/substitutions/route');

    const req = new NextRequest('http://localhost/api/substitutions?date=20250210');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.type).toBe('meta');
    expect(json.config).toBeUndefined();
  });

  it('enforces rate limiting with retry-after header', async () => {
    const payload = {
      payload: {
        date: 20250210,
        rows: [],
        lastUpdate: null,
      },
    };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { GET } = await import('@/app/api/substitutions/route');

    let lastResponse: Response | null = null;
    for (let index = 0; index < 61; index += 1) {
      const req = new NextRequest('http://localhost/api/substitutions?date=20250210', {
        headers: { 'x-real-ip': '1.1.1.1' },
      });
      lastResponse = await GET(req);
    }

    expect(lastResponse?.status).toBe(429);
    expect(lastResponse?.headers.get('Retry-After')).toBeTruthy();
  });

  it('returns 503 on upstream availability failures', async () => {
    const fetchMock = vi.fn().mockImplementation(async () =>
      new Response(JSON.stringify({ error: 'upstream down' }), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'content-type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { GET } = await import('@/app/api/substitutions/route');

    const req = new NextRequest('http://localhost/api/substitutions?date=20250210');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.error).toContain('nicht erreichbar');
  });

  it('retries on transient network errors and eventually succeeds', async () => {
    const successPayload = {
      payload: {
        date: 20250210,
        rows: [],
        lastUpdate: 'now',
      },
    };

    const networkError = Object.assign(new TypeError('Network error'), { code: 'ECONNRESET' });

    const fetchMock = vi
      .fn()
      // First call: simulate a network error (e.g. ECONNRESET / TypeError from fetch)
      .mockRejectedValueOnce(networkError)
      // Second call: successful response
      .mockResolvedValueOnce(
        new Response(JSON.stringify(successPayload), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

    vi.stubGlobal('fetch', fetchMock);

    const { GET } = await import('@/app/api/substitutions/route');

    const req = new NextRequest('http://localhost/api/substitutions?date=20250210');
    const response = await GET(req);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.date).toBe(20250210);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns 503 after exhausting retries on persistent network errors', async () => {
    const networkError = Object.assign(new TypeError('Persistent network error'), { code: 'ETIMEDOUT' });
    const fetchMock = vi.fn().mockRejectedValue(networkError);

    vi.stubGlobal('fetch', fetchMock);

    const { GET } = await import('@/app/api/substitutions/route');

    const req = new NextRequest('http://localhost/api/substitutions?date=20250210');
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.error).toContain('nicht erreichbar');
    expect(fetchMock).toHaveBeenCalledTimes(3); // Should retry 3 times (UPSTREAM_MAX_ATTEMPTS)
  });

  it('serves demo dataset rows in demo mode without upstream fetch', async () => {
    process.env.APP_MODE = 'demo';
    getStoredDemoDatasetMock.mockResolvedValue({
      generatedAt: '2026-02-16T12:00:00.000Z',
      days: {
        '20260216': [
          {
            data: ['1', '07:45-08:30', 'DEMO', 'MAT', 'R1', 'ABCD', 'Vertretung', 'Demo'],
            cssClasses: [],
            cellClasses: {},
            group: 'DEMO',
          },
        ],
      },
    });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { GET } = await import('@/app/api/substitutions/route');
    const response = await GET(new NextRequest('http://localhost/api/substitutions?date=20260216'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.type).toBe('substitution');
    expect(json.rows).toHaveLength(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 for out-of-range demo dates', async () => {
    process.env.APP_MODE = 'demo';

    const { GET } = await import('@/app/api/substitutions/route');
    const response = await GET(new NextRequest('http://localhost/api/substitutions?date=20260301'));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('Demo-Modus');
  });

  it('returns meta response in demo mode when dataset is missing', async () => {
    process.env.APP_MODE = 'demo';
    getStoredDemoDatasetMock.mockResolvedValue(null);

    const { GET } = await import('@/app/api/substitutions/route');
    const response = await GET(new NextRequest('http://localhost/api/substitutions?date=20260216'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.type).toBe('meta');
    expect(json.message).toContain('Demo-Daten');
  });
});
