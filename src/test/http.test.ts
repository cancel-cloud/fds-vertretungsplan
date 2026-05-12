import { describe, expect, it, vi } from 'vitest';
import { buildJsonRequest, createFetchRouter, jsonResponse } from '@/test/http';

describe('http test helpers', () => {
  it('creates a JSON response with the expected content type', async () => {
    const response = jsonResponse({ ok: true }, { status: 201 });

    expect(response.status).toBe(201);
    expect(response.headers.get('content-type')).toContain('application/json');
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('builds a JSON request body with the expected headers', async () => {
    const request = buildJsonRequest('http://localhost/api/example', { hello: 'world' }, { method: 'PATCH' });

    expect(request.method).toBe('PATCH');
    expect(request.headers.get('content-type')).toContain('application/json');
    await expect(request.json()).resolves.toEqual({ hello: 'world' });
  });

  it('defaults JSON requests to POST when no method is supplied', () => {
    const request = buildJsonRequest('http://localhost/api/example', { hello: 'world' });

    expect(request.method).toBe('POST');
  });

  it('routes fetch calls by matcher', async () => {
    const fetchMock = vi.fn(
      createFetchRouter([
        {
          match: (url) => url.pathname === '/api/me',
          response: jsonResponse({ user: { id: 'user-1' } }),
        },
      ])
    );

    const response = await fetchMock('http://localhost/api/me');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ user: { id: 'user-1' } });
  });
});
