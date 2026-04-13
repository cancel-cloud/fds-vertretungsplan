import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplePushPromoCard } from '@/components/stundenplan/apple-push-promo-card';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';

const mocks = vi.hoisted(() => ({
  captureMock: vi.fn(),
  platformStateMock: vi.fn(() => 'desktop_supported'),
  browserNameMock: vi.fn(() => 'Safari'),
  isDismissedMock: vi.fn(() => false),
  dismissMock: vi.fn(),
  confettiMock: vi.fn(),
}));

vi.mock('canvas-confetti', () => ({
  default: mocks.confettiMock,
}));

vi.mock('@/providers/posthog-provider', () => ({
  usePostHogContext: () => ({
    capture: mocks.captureMock,
    isFeatureEnabled: vi.fn(),
    getFlagNumber: vi.fn(),
    featureFlagsReady: true,
    deviceId: 'test-device',
  }),
}));

vi.mock('@/lib/apple-device', () => ({
  getPushPromoPlatformState: mocks.platformStateMock,
  getBrowserDisplayName: mocks.browserNameMock,
}));

vi.mock('@/lib/promo-dismissal', () => ({
  isApplePushPromoDismissed: mocks.isDismissedMock,
  dismissApplePushPromo: mocks.dismissMock,
}));

vi.mock('@/components/stundenplan/push-opt-in-card', () => ({
  PushOptInCard: ({
    onEnableStart,
    onEnableSuccess,
  }: {
    onEnableStart?: () => void;
    onEnableSuccess?: () => void;
  }) => (
    <div>
      <p>Mock Push OptIn</p>
      <button
        type="button"
        onClick={() => {
          onEnableStart?.();
          onEnableSuccess?.();
        }}
      >
        Mock Push Aktivieren
      </button>
    </div>
  ),
}));

describe('ApplePushPromoCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.platformStateMock.mockReturnValue('desktop_supported');
    mocks.browserNameMock.mockReturnValue('Safari');
    mocks.isDismissedMock.mockReturnValue(false);

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders compact desktop widget with browser name and activation CTA', () => {
    render(<ApplePushPromoCard initialPushEnabled={false} />);

    expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    expect(screen.getByText('Safari unterstützt Web-Push. Aktiviere Benachrichtigungen direkt hier.')).toBeInTheDocument();
    expect(screen.getByText('Mock Push OptIn')).toBeInTheDocument();
  });

  it('renders mobile browser share/add-home flow', () => {
    mocks.platformStateMock.mockReturnValue('mobile_browser');

    render(<ApplePushPromoCard initialPushEnabled={false} />);

    expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    expect(
      screen.getByText('Füge die Website zuerst zum Home-Bildschirm hinzu. Danach kannst du Push-Benachrichtigungen in der App aktivieren.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Teilen & Home-Bildschirm/i })).toBeInTheDocument();
  });

  it('shows post-share guidance and fires confetti after native share', async () => {
    mocks.platformStateMock.mockReturnValue('mobile_browser');
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: shareMock,
    });

    const user = userEvent.setup();
    render(<ApplePushPromoCard initialPushEnabled={false} />);

    await user.click(screen.getByRole('button', { name: /Teilen & Home-Bildschirm/i }));

    expect(shareMock).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mocks.confettiMock).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('Nutze jetzt die App vom Home-Bildschirm. Dieser Browser-Tab kann geschlossen werden.')).toBeInTheDocument();
    expect(mocks.captureMock).toHaveBeenCalledWith(
      ANALYTICS_EVENTS.APPLE_PROMO_MOBILE_POST_SHARE_SHOWN,
      expect.objectContaining({ platform_state: 'mobile_browser', browser_name: 'Safari' })
    );
  });

  it('falls back to clipboard when native share is unavailable', async () => {
    mocks.platformStateMock.mockReturnValue('mobile_browser');

    const user = userEvent.setup();
    render(<ApplePushPromoCard initialPushEnabled={false} />);

    await user.click(screen.getByRole('button', { name: /Teilen & Home-Bildschirm/i }));

    expect(await screen.findByText('Link wurde in die Zwischenablage kopiert.')).toBeInTheDocument();
    expect(mocks.captureMock).toHaveBeenCalledWith(
      ANALYTICS_EVENTS.APPLE_PROMO_SHARE_COPY_FALLBACK,
      expect.objectContaining({ platform_state: 'mobile_browser', browser_name: 'Safari' })
    );
  });

  it('dismisses and hides widget', async () => {
    const user = userEvent.setup();
    render(<ApplePushPromoCard initialPushEnabled={false} />);

    await user.click(screen.getByRole('button', { name: 'Hinweis ausblenden' }));

    expect(mocks.dismissMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Push Notifications')).not.toBeInTheDocument();
  });

  it('shows standalone activation flow and hides after success', async () => {
    mocks.platformStateMock.mockReturnValue('mobile_standalone');

    const user = userEvent.setup();
    render(<ApplePushPromoCard initialPushEnabled={false} />);

    expect(screen.getByText('Home-Bildschirm-App erkannt.')).toBeInTheDocument();
    expect(screen.getByText('Mock Push OptIn')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mock Push Aktivieren' }));

    expect(mocks.captureMock).toHaveBeenCalledWith(
      ANALYTICS_EVENTS.APPLE_PROMO_PUSH_ENABLE_SUCCESS,
      expect.objectContaining({ platform_state: 'mobile_standalone', browser_name: 'Safari' })
    );
    expect(screen.queryByText('Push Notifications')).not.toBeInTheDocument();
  });

  it('renders nothing in unsupported state', () => {
    mocks.platformStateMock.mockReturnValue('unsupported');

    render(<ApplePushPromoCard initialPushEnabled={false} />);

    expect(screen.queryByText('Push Notifications')).not.toBeInTheDocument();
  });
});
