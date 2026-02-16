import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminPanel } from '@/components/stundenplan/admin-panel';

const mocks = vi.hoisted(() => ({
  signOutMock: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  signOut: mocks.signOutMock,
}));

interface TestAdminUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

const createJsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const createUser = (overrides: TestAdminUser) => ({
  id: overrides.id,
  email: overrides.email,
  role: overrides.role,
  onboardingCompletedAt: null,
  onboardingSkippedAt: null,
  notificationsEnabled: false,
  notificationLookaheadSchoolDays: 1,
  timetableCount: 0,
  pushSubscriptionCount: 0,
  createdAt: '2026-02-16T10:00:00.000Z',
  notificationStats: {
    totalFingerprints: 0,
    activeStates: 0,
    lastSentAt: null,
    lastTargetDate: null,
  },
  subscriptionStats: {
    lastSeenAt: null,
    lastUpdatedAt: null,
  },
});

const setupFetch = (
  initialUsers: Array<ReturnType<typeof createUser>>,
  patchHandler: (body: Record<string, unknown>) => { status?: number; body: unknown },
  demoDataHandler: (body: Record<string, unknown>) => { status?: number; body: unknown } = () => ({
    body: { ok: true },
  })
) => {
  let users = [...initialUsers];

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';

    if (url.includes('/api/admin/teachers')) {
      return createJsonResponse({ teachers: [], subjectCodes: [] });
    }

    if (url.includes('/api/admin/users?page=') && method === 'GET') {
      return createJsonResponse({
        users,
        pagination: {
          page: 1,
          pageSize: 20,
          total: users.length,
          totalPages: 1,
        },
      });
    }

    if (url.includes('/api/admin/users') && method === 'PATCH') {
      const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      const result = patchHandler(body);
      return createJsonResponse(result.body, result.status ?? 200);
    }

    if (url.includes('/api/admin/demo-data') && method === 'POST') {
      const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      const result = demoDataHandler(body);
      return createJsonResponse(result.body, result.status ?? 200);
    }

    throw new Error(`Unhandled fetch call: ${method} ${url}`);
  });

  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, setUsers: (next: Array<ReturnType<typeof createUser>>) => (users = [...next]) };
};

describe('AdminPanel role demotion confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signOutMock.mockResolvedValue(undefined);
  });

  it('opens confirmation dialog when clicking "Zu USER" for an admin', async () => {
    const adminUser = createUser({ id: 'admin-2', email: 'admin2@example.com', role: 'ADMIN' });
    setupFetch([adminUser], () => ({ body: { user: adminUser, selfDemoted: false } }));

    const user = userEvent.setup();
    render(<AdminPanel currentUserId="admin-1" />);

    const row = await screen.findByText('admin2@example.com');
    await user.click(within(row.closest('tr') as HTMLElement).getByRole('button', { name: 'Zu USER' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Bitte geben Sie zur Bestätigung die E-Mail-Adresse/i)).toBeInTheDocument();
    expect(within(dialog).getByText('admin2@example.com')).toBeInTheDocument();
  });

  it('keeps confirm button disabled until matching email is entered', async () => {
    const adminUser = createUser({ id: 'admin-2', email: 'admin2@example.com', role: 'ADMIN' });
    setupFetch([adminUser], () => ({ body: { user: adminUser, selfDemoted: false } }));

    const user = userEvent.setup();
    render(<AdminPanel currentUserId="admin-1" />);

    const row = await screen.findByText('admin2@example.com');
    await user.click(within(row.closest('tr') as HTMLElement).getByRole('button', { name: 'Zu USER' }));

    const confirmButton = await screen.findByRole('button', { name: 'Herabstufen' });
    expect(confirmButton).toBeDisabled();

    await user.type(screen.getByLabelText('E-Mail zur Bestätigung'), 'wrong@example.com');
    expect(confirmButton).toBeDisabled();

    await user.clear(screen.getByLabelText('E-Mail zur Bestätigung'));
    await user.type(screen.getByLabelText('E-Mail zur Bestätigung'), ' Admin2@Example.com ');
    expect(confirmButton).toBeEnabled();
  });

  it('sends confirmationEmail in demotion request', async () => {
    const adminUser = createUser({ id: 'admin-2', email: 'admin2@example.com', role: 'ADMIN' });
    const patchBodies: Array<Record<string, unknown>> = [];
    setupFetch([adminUser], (body) => {
      patchBodies.push(body);
      return {
        body: { user: createUser({ id: 'admin-2', email: 'admin2@example.com', role: 'USER' }), selfDemoted: false },
      };
    });

    const user = userEvent.setup();
    render(<AdminPanel currentUserId="admin-1" />);

    const row = await screen.findByText('admin2@example.com');
    await user.click(within(row.closest('tr') as HTMLElement).getByRole('button', { name: 'Zu USER' }));
    await user.type(screen.getByLabelText('E-Mail zur Bestätigung'), 'admin2@example.com');
    await user.click(screen.getByRole('button', { name: 'Herabstufen' }));

    await waitFor(() => {
      expect(patchBodies).toHaveLength(1);
    });
    expect(patchBodies[0]).toMatchObject({
      id: 'admin-2',
      role: 'USER',
      confirmationEmail: 'admin2@example.com',
    });
  });

  it('does not open dialog for "Zu ADMIN"', async () => {
    const normalUser = createUser({ id: 'user-1', email: 'user1@example.com', role: 'USER' });
    const patchBodies: Array<Record<string, unknown>> = [];
    setupFetch([normalUser], (body) => {
      patchBodies.push(body);
      return {
        body: { user: createUser({ id: 'user-1', email: 'user1@example.com', role: 'ADMIN' }), selfDemoted: false },
      };
    });

    const user = userEvent.setup();
    render(<AdminPanel currentUserId="admin-1" />);

    const row = await screen.findByText('user1@example.com');
    await user.click(within(row.closest('tr') as HTMLElement).getByRole('button', { name: 'Zu ADMIN' }));

    await waitFor(() => {
      expect(patchBodies).toHaveLength(1);
    });
    expect(patchBodies[0]).toMatchObject({ id: 'user-1', role: 'ADMIN' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('signs out immediately when self demoted', async () => {
    const selfAdmin = createUser({ id: 'admin-self', email: 'self@example.com', role: 'ADMIN' });
    setupFetch([selfAdmin], () => ({
      body: { user: createUser({ id: 'admin-self', email: 'self@example.com', role: 'USER' }), selfDemoted: true },
    }));

    const user = userEvent.setup();
    render(<AdminPanel currentUserId="admin-self" />);

    const row = await screen.findByText('self@example.com');
    await user.click(within(row.closest('tr') as HTMLElement).getByRole('button', { name: 'Zu USER' }));
    await user.type(screen.getByLabelText('E-Mail zur Bestätigung'), 'self@example.com');
    await user.click(screen.getByRole('button', { name: 'Herabstufen' }));

    await waitFor(() => {
      expect(mocks.signOutMock).toHaveBeenCalledWith({ callbackUrl: '/stundenplan/login' });
    });
  });

  it('shows API errors inside dialog', async () => {
    const adminUser = createUser({ id: 'admin-2', email: 'admin2@example.com', role: 'ADMIN' });
    setupFetch([adminUser], () => ({
      status: 400,
      body: { error: 'Bestätigungs-E-Mail stimmt nicht mit dem Zielkonto überein.' },
    }));

    const user = userEvent.setup();
    render(<AdminPanel currentUserId="admin-1" />);

    const row = await screen.findByText('admin2@example.com');
    await user.click(within(row.closest('tr') as HTMLElement).getByRole('button', { name: 'Zu USER' }));
    await user.type(screen.getByLabelText('E-Mail zur Bestätigung'), 'admin2@example.com');
    await user.click(screen.getByRole('button', { name: 'Herabstufen' }));

    expect(await screen.findByText('Bestätigungs-E-Mail stimmt nicht mit dem Zielkonto überein.')).toBeInTheDocument();
  });

  it('renders and triggers demo-data generation button in demo mode', async () => {
    const targetUser = {
      ...createUser({ id: 'user-1', email: 'user1@example.com', role: 'USER' }),
      timetableCount: 3,
    };
    const demoBodies: Array<Record<string, unknown>> = [];

    setupFetch(
      [targetUser],
      () => ({ body: { user: targetUser, selfDemoted: false } }),
      (body) => {
        demoBodies.push(body);
        return {
          body: {
            ok: true,
            selectedDates: { past: 20260213, today: 20260216, future: 20260217 },
            guarantees: { pastMatches: 1, todayMatches: 1, futureMatches: 1 },
          },
        };
      }
    );

    const user = userEvent.setup();
    render(<AdminPanel currentUserId="admin-1" isDemoMode />);

    const row = await screen.findByText('user1@example.com');
    await user.click(within(row.closest('tr') as HTMLElement).getByRole('button', { name: 'Demo-Daten generieren' }));

    await waitFor(() => {
      expect(demoBodies).toHaveLength(1);
    });
    expect(demoBodies[0]).toMatchObject({ userId: 'user-1' });
  });
});
