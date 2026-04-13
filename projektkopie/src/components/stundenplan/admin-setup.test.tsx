import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminSetup } from '@/components/stundenplan/admin-setup';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

describe('AdminSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a load error instead of the empty success state when teacher loading returns 200 non-json', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<html>ok</html>', { status: 200, headers: { 'Content-Type': 'text/html' } }))
    );

    render(<AdminSetup />);

    await waitFor(() => {
      expect(screen.getByText('Ungültige Serverantwort.')).toBeInTheDocument();
    });

    expect(screen.queryByText('Noch keine Lehrer hinterlegt.')).not.toBeInTheDocument();
  });
});
