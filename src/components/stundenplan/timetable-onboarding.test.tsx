import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TimetableOnboarding } from '@/components/stundenplan/timetable-onboarding';

const mocks = vi.hoisted(() => ({
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mocks.router,
}));

const createJsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('TimetableOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps start/end/duration fields in sync while editing', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';

      if (url.includes('/api/timetable') && method === 'GET') {
        return createJsonResponse({
          entries: [
            {
              id: 'entry-1',
              weekday: 'MON',
              startPeriod: 1,
              duration: 1,
              subjectCode: 'MATH',
              teacherCode: 'ROHA',
              room: 'R1',
              weekMode: 'ALL',
            },
          ],
          presets: [],
        });
      }

      if (url.includes('/api/teachers') && method === 'GET') {
        return createJsonResponse({
          teachers: [{ code: 'ROHA', fullName: 'Rohal Name' }],
        });
      }

      return createJsonResponse({});
    });
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<TimetableOnboarding mode="edit" />);

    await screen.findByText('MATH');
    await user.click(screen.getByLabelText('Eintrag bearbeiten'));

    const startSelect = screen.getByLabelText('Startstunde') as HTMLSelectElement;
    const endSelect = screen.getByLabelText('Endstunde') as HTMLSelectElement;
    const durationSelect = screen.getByLabelText('Dauer') as HTMLSelectElement;

    await user.selectOptions(startSelect, '2');
    expect(startSelect.value).toBe('2');
    expect(endSelect.value).toBe('2');
    expect(durationSelect.value).toBe('1');

    await user.selectOptions(durationSelect, '3');
    expect(endSelect.value).toBe('4');
    expect(durationSelect.value).toBe('3');

    await user.selectOptions(endSelect, '3');
    expect(durationSelect.value).toBe('2');
  });

  it('shows overlap confirmation and sends allowOverlaps=true when confirmed', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';

      if (url.includes('/api/timetable') && method === 'GET') {
        return createJsonResponse({
          entries: [
            {
              id: 'entry-1',
              weekday: 'MON',
              startPeriod: 1,
              duration: 1,
              subjectCode: 'MATH',
              teacherCode: 'ROHA',
              room: 'R1',
              weekMode: 'ALL',
            },
          ],
          presets: [],
        });
      }

      if (url.includes('/api/teachers') && method === 'GET') {
        return createJsonResponse({
          teachers: [{ code: 'ROHA', fullName: 'Rohal Name' }],
        });
      }

      if (url.includes('/api/timetable') && method === 'PUT') {
        return createJsonResponse({ entries: [], presets: [] });
      }

      return createJsonResponse({});
    });

    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<TimetableOnboarding mode="edit" />);

    await screen.findByText('MATH');
    await user.click(screen.getByLabelText('Montag, Stunde 1 hinzufügen'));
    await user.click(screen.getByRole('button', { name: '1 Stunde' }));

    await user.clear(screen.getByLabelText('Fach-Kürzel'));
    await user.type(screen.getByLabelText('Fach-Kürzel'), 'ENGL');
    await user.clear(screen.getByLabelText('Lehrer-Kürzel'));
    await user.type(screen.getByLabelText('Lehrer-Kürzel'), 'ABCD');
    await user.click(screen.getByText('Eintrag speichern'));

    await user.click(screen.getByText('Änderungen speichern'));

    await screen.findByText('Überlappungen erkannt');
    const putCallsBeforeConfirm = fetchMock.mock.calls.filter(([, init]) => (init?.method ?? 'GET') === 'PUT');
    expect(putCallsBeforeConfirm).toHaveLength(0);

    await user.click(screen.getByText('Trotzdem speichern'));

    await waitFor(() => {
      const putCalls = fetchMock.mock.calls.filter(([, init]) => (init?.method ?? 'GET') === 'PUT');
      expect(putCalls).toHaveLength(1);
    });

    const saveCall = fetchMock.mock.calls.find(([, init]) => (init?.method ?? 'GET') === 'PUT');
    const saveBody = JSON.parse(String(saveCall?.[1]?.body)) as { allowOverlaps?: boolean };
    expect(saveBody.allowOverlaps).toBe(true);
  });
});
