import { beforeEach, describe, expect, it, vi } from 'vitest';

const getStoredDemoDatasetMock = vi.fn();
const getDemoRowsForDateMock = vi.fn();

vi.mock('@/lib/demo-config', () => ({
  isDemoMode: vi.fn(() => false),
  isDemoDateAllowed: vi.fn(() => true),
}));

vi.mock('@/lib/demo-substitutions', () => ({
  getStoredDemoDataset: getStoredDemoDatasetMock,
  getDemoRowsForDate: getDemoRowsForDateMock,
  buildDemoDatasetMissingMessage: () => 'Demo-Daten sind noch nicht erzeugt.',
}));

describe('untis client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStoredDemoDatasetMock.mockResolvedValue(null);
    getDemoRowsForDateMock.mockImplementation((dataset: { days?: Record<string, unknown[]> }, dateNumber: number) =>
      dataset.days?.[String(dateNumber)] ?? []
    );
  });

  it('builds the expected Untis request payload', async () => {
    const { buildUntisRequestPayload } = await import('@/lib/untis-client');

    expect(buildUntisRequestPayload(20260216, 'friedrich-dessauer-schule-limburg')).toMatchObject({
      formatName: 'Web-Schüler-heute',
      schoolName: 'friedrich-dessauer-schule-limburg',
      date: 20260216,
      dateOffset: 0,
      showTeacher: true,
      showOnlyFutureSub: true,
    });
  });

  it('converts dates into Untis date numbers', async () => {
    const { toUntisDateNumber } = await import('@/lib/untis-client');

    expect(toUntisDateNumber(new Date('2026-02-16T12:00:00.000Z'))).toBe(20260216);
  });

  it('returns demo rows without hitting the network in demo mode', async () => {
    const { isDemoMode } = await import('@/lib/demo-config');
    vi.mocked(isDemoMode).mockReturnValue(true);
    getStoredDemoDatasetMock.mockResolvedValue({
      generatedAt: '2026-02-16T12:00:00.000Z',
      days: {
        '20260216': [
          {
            data: ['1', '07:45-08:30', '10A', 'MAT', 'A101', 'ABC', 'Vertretung', 'Demo'],
            cssClasses: [],
            cellClasses: {},
            group: '10A',
          },
        ],
      },
    });

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { fetchUntisRowsForDate } = await import('@/lib/untis-client');
    const result = await fetchUntisRowsForDate(new Date('2026-02-16T12:00:00.000Z'));

    expect(result.date).toBe(20260216);
    expect(result.rows).toHaveLength(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
