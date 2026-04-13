import { describe, expect, it, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
}));

vi.mock('next-auth/jwt', () => ({
  getToken: mocks.getToken,
}));

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getToken.mockResolvedValue(null);
  });

  it('allows guests to access /stundenplan/dashboard so the page can fall back to lite view', async () => {
    const request = new NextRequest('http://localhost:3000/stundenplan/dashboard?date=20260317&scope=personal');

    const response = await middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('still redirects guests away from protected stundenplan pages', async () => {
    const request = new NextRequest('http://localhost:3000/stundenplan/settings');

    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/stundenplan/login');
  });
});
