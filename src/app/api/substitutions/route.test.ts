import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/analytics/posthog-server', () => ({
  captureServerEvent: vi.fn().mockResolvedValue(undefined),
}));

const originalEnv = { ...process.env };

describe('api/substitutions route', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.UNTIS_BASE_URL;
    delete process.env.UNTIS_SCHOOL;
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
});
