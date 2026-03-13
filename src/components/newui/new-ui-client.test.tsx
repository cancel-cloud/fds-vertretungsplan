import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewUiClient } from '@/components/newui/new-ui-client';

const mocks = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  capture: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mocks.routerReplace,
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: () => null,
    toString: () => '',
  }),
}));

vi.mock('@/providers/posthog-provider', () => ({
  usePostHogContext: () => ({
    capture: mocks.capture,
    isFeatureEnabled: vi.fn(() => false),
  }),
}));

vi.mock('@/hooks/use-substitutions', () => ({
  useSubstitutions: () => ({
    substitutions: [],
    isLoading: false,
    error: null,
    metaResponse: null,
    refetch: mocks.refetch,
  }),
}));

vi.mock('@/components/search-input', () => ({
  SearchInput: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <input aria-label="Suche" value={value} onChange={(event) => onChange(event.target.value)} />
  ),
}));

vi.mock('@/components/category-filters', () => ({
  CategoryFilters: () => null,
}));

vi.mock('@/components/substitution-card', () => ({
  SubstitutionCard: () => null,
}));

vi.mock('@/components/newui/login-promo-card', () => ({
  LoginPromoCard: () => <div>Login Promo</div>,
}));

vi.mock('@/components/calendar-widget', () => ({
  CalendarWidget: ({ onDateSelect }: { onDateSelect: (date: Date) => void }) => (
    <div>
      <p>Kalender-Widget</p>
      <button type="button" onClick={() => onDateSelect(new Date(2026, 1, 17))}>
        Datum im Kalender wählen
      </button>
    </div>
  ),
}));

describe('NewUiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens the calendar dialog from the desktop date trigger and updates the selected date', async () => {
    render(<NewUiClient analyticsSource="test" />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /ausgewähltes datum/i }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Datum wählen')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Datum im Kalender wählen' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /ausgewähltes datum/i })).toHaveTextContent('Dienstag, 17. Februar 2026');
  });
});
