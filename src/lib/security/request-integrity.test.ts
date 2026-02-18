import { afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { enforceSameOrigin } from '@/lib/security/request-integrity';

const originalNodeEnv = process.env.NODE_ENV;
const originalAppMode = process.env.APP_MODE;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  if (originalAppMode === undefined) {
    delete process.env.APP_MODE;
  } else {
    process.env.APP_MODE = originalAppMode;
  }
});

describe('request-integrity same-origin enforcement', () => {
  it('rejects mutating requests without origin in production mode', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.APP_MODE;

    const request = new NextRequest('https://app.example/api/me', { method: 'PUT' });
    const response = enforceSameOrigin(request);

    expect(response?.status).toBe(403);
  });

  it('allows matching origin in production mode', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.APP_MODE;

    const request = new NextRequest('https://app.example/api/me', {
      method: 'PUT',
      headers: { origin: 'https://app.example' },
    });
    const response = enforceSameOrigin(request);

    expect(response).toBeNull();
  });

  it('bypasses origin checks in demo mode', () => {
    process.env.NODE_ENV = 'production';
    process.env.APP_MODE = 'demo';

    const request = new NextRequest('https://app.example/api/me', { method: 'PUT' });
    const response = enforceSameOrigin(request);

    expect(response).toBeNull();
  });
});
