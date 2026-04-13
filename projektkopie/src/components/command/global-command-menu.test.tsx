import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GlobalCommandMenu } from '@/components/command/global-command-menu';
import { resolveCommandSearchIntent } from '@/lib/command-menu/search-intent';

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  signOut: vi.fn(),
  pathname: '/',
  searchParams: '',
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.routerPush,
    replace: mocks.routerReplace,
  }),
  usePathname: () => mocks.pathname,
  useSearchParams: () => ({
    get: (key: string) => new URLSearchParams(mocks.searchParams).get(key),
    toString: () => mocks.searchParams,
  }),
}));

vi.mock('next-auth/react', () => ({
  signOut: mocks.signOut,
}));

const createJsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const openMenu = async () => {
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
  await screen.findByText('Go to Home');
};

describe('GlobalCommandMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pathname = '/';
    mocks.searchParams = '';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens via Ctrl+K', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 401 })));
    render(<GlobalCommandMenu isDemoMode={false} />);

    await openMenu();

    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
  });

  it('shows guest commands for unauthenticated users', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 401 })));
    render(<GlobalCommandMenu isDemoMode={false} />);

    await openMenu();
    await screen.findByText('Log in');

    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Log out')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    expect(screen.queryByText('Generate test data')).not.toBeInTheDocument();
  });

  it('shows authenticated user commands', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        createJsonResponse({
          user: {
            id: 'u1',
            email: 'user@example.com',
            role: 'USER',
          },
        })
      )
    );
    render(<GlobalCommandMenu isDemoMode={false} />);

    await openMenu();
    await screen.findByText('Log out');

    expect(screen.getByText('Edit Timetable')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('shows admin commands for admin users', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        createJsonResponse({
          user: {
            id: 'admin-1',
            email: 'admin@example.com',
            role: 'ADMIN',
          },
        })
      )
    );
    render(<GlobalCommandMenu isDemoMode={false} />);

    await openMenu();
    await screen.findByText('Admin Panel');

    expect(screen.getByText('Admin Setup')).toBeInTheDocument();
    expect(screen.queryByText('Generate test data')).not.toBeInTheDocument();
  });

  it('shows debug command for admin users in demo mode', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        createJsonResponse({
          user: {
            id: 'admin-1',
            email: 'admin@example.com',
            role: 'ADMIN',
          },
        })
      )
    );
    render(<GlobalCommandMenu isDemoMode />);

    await openMenu();
    await screen.findByText('Generate test data');

    expect(screen.getByText('Generate test data')).toBeInTheDocument();
  });

  it('routes search command correctly for authenticated users', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        createJsonResponse({
          user: {
            id: 'u1',
            email: 'user@example.com',
            role: 'USER',
          },
        })
      )
    );
    const user = userEvent.setup();
    render(<GlobalCommandMenu isDemoMode={false} />);

    await openMenu();
    const input = await screen.findByPlaceholderText('Type a command or search...');
    await user.type(input, 'tomorrow math{enter}');

    const expected = resolveCommandSearchIntent({
      query: 'tomorrow math',
      isAuthenticated: true,
    });
    expect(mocks.routerPush).toHaveBeenCalledWith(expected.href);
  });

  it('routes search command correctly for guests', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 401 })));
    const user = userEvent.setup();
    render(<GlobalCommandMenu isDemoMode={false} />);

    await openMenu();
    const input = await screen.findByPlaceholderText('Type a command or search...');
    await user.type(input, 'today math{enter}');

    const expected = resolveCommandSearchIntent({
      query: 'today math',
      isAuthenticated: false,
    });
    expect(mocks.routerPush).toHaveBeenCalledWith(expected.href);
  });

  it('resolves login query to login command instead of search', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 401 })));
    const user = userEvent.setup();
    render(<GlobalCommandMenu isDemoMode={false} />);

    await openMenu();
    const input = await screen.findByPlaceholderText('Type a command or search...');
    await user.type(input, 'login{enter}');

    expect(mocks.routerPush).toHaveBeenCalledWith('/stundenplan/login');
  });

  it('calls signOut with callback URL when selecting Log out', async () => {
    mocks.signOut.mockResolvedValue(undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        createJsonResponse({
          user: {
            id: 'u1',
            email: 'user@example.com',
            role: 'USER',
          },
        })
      )
    );
    const user = userEvent.setup();
    render(<GlobalCommandMenu isDemoMode={false} />);

    await openMenu();
    await screen.findByText('Log out');
    await user.click(screen.getByText('Log out'));

    await waitFor(() => {
      expect(mocks.signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
    });
  });
});
