import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { enforceSameOrigin } from '@/lib/security/request-integrity';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('request-integrity same-origin enforcement', () => {
  it('rejects mutating requests without origin in production mode', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const request = new NextRequest('https://app.example/api/me', { method: 'PUT' });
    const response = enforceSameOrigin(request);

    expect(response?.status).toBe(403);
  });

  it('allows matching origin in production mode', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const request = new NextRequest('https://app.example/api/me', {
      method: 'PUT',
      headers: { origin: 'https://app.example' },
    });
    const response = enforceSameOrigin(request);

    expect(response).toBeNull();
  });

  it('bypasses origin checks in demo mode', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('APP_MODE', 'demo');

    const request = new NextRequest('https://app.example/api/me', { method: 'PUT' });
    const response = enforceSameOrigin(request);

    expect(response).toBeNull();
  });
});
