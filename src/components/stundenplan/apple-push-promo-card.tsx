'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BellRing, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PushOptInCard } from '@/components/stundenplan/push-opt-in-card';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { getBrowserDisplayName, getPushPromoPlatformState, PushPromoPlatformState } from '@/lib/apple-device';
import { dismissApplePushPromo, isApplePushPromoDismissed } from '@/lib/promo-dismissal';
import { usePostHogContext } from '@/providers/posthog-provider';

interface ApplePushPromoCardProps {
  initialPushEnabled: boolean;
}

const SHARE_TARGET_PATH = '/';

const getShareUrl = (): string => new URL(SHARE_TARGET_PATH, window.location.origin).toString();

const launchShareConfetti = async (): Promise<void> => {
  try {
    const confettiModule = await import('canvas-confetti');
    confettiModule.default({
      particleCount: 42,
      spread: 58,
      startVelocity: 28,
      scalar: 0.82,
      origin: { y: 0.82 },
    });
  } catch {
    // Confetti is optional UI sugar.
  }
};

export function ApplePushPromoCard({ initialPushEnabled }: ApplePushPromoCardProps) {
  const { capture } = usePostHogContext();
  const [platformState, setPlatformState] = useState<PushPromoPlatformState>('unsupported');
  const [browserName, setBrowserName] = useState('Unknown Browser');
  const [isDismissed, setIsDismissed] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(initialPushEnabled);
  const [postShareShown, setPostShareShown] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const impressionTrackedRef = useRef(false);

  useEffect(() => {
    setPushEnabled(initialPushEnabled);
  }, [initialPushEnabled]);

  useEffect(() => {
    setPlatformState(getPushPromoPlatformState());
    setBrowserName(getBrowserDisplayName());
    setIsDismissed(isApplePushPromoDismissed());
  }, []);

  const analyticsBase = useMemo(
    () => ({
      platform_state: platformState,
      browser_name: browserName,
    }),
    [browserName, platformState]
  );

  useEffect(() => {
    if (
      platformState === 'unsupported' ||
      isDismissed ||
      pushEnabled ||
      impressionTrackedRef.current
    ) {
      return;
    }

    impressionTrackedRef.current = true;
    capture(ANALYTICS_EVENTS.APPLE_PROMO_IMPRESSION, analyticsBase);
  }, [analyticsBase, capture, isDismissed, platformState, pushEnabled]);

  useEffect(() => {
    if (platformState !== 'mobile_standalone' || pushEnabled) {
      return;
    }

    let active = true;

    const checkExistingPermissionAndSubscription = async () => {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        return;
      }

      if (Notification.permission !== 'granted') {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        if (active && subscription) {
          setPushEnabled(true);
        }
      } catch {
        // Ignore and keep CTA visible.
      }
    };

    void checkExistingPermissionAndSubscription();

    return () => {
      active = false;
    };
  }, [platformState, pushEnabled]);

  if (platformState === 'unsupported' || isDismissed || pushEnabled) {
    return null;
  }

  const isDesktopSupported = platformState === 'desktop_supported';
  const isMobileBrowser = platformState === 'mobile_browser';
  const isMobileStandalone = platformState === 'mobile_standalone';

  const description = isDesktopSupported
    ? `${browserName} unterstützt Web-Push. Aktiviere Benachrichtigungen direkt hier.`
    : isMobileStandalone
      ? 'Benachrichtigungsanfrage in deinem Browser auf „Erlauben“ setzen und Benachrichtigungen direkt hier aktivieren.'
      : postShareShown
        ? 'Nutze jetzt die App vom Home-Bildschirm. Dieser Browser-Tab kann geschlossen werden.'
        : 'Füge die Website zuerst zum Home-Bildschirm hinzu. Danach kannst du Push-Benachrichtigungen in der App aktivieren.';

  const markPostShareShown = () => {
    setPostShareShown(true);
    capture(ANALYTICS_EVENTS.APPLE_PROMO_MOBILE_POST_SHARE_SHOWN, analyticsBase);
  };

  const handleDismiss = () => {
    dismissApplePushPromo();
    setIsDismissed(true);
    capture(ANALYTICS_EVENTS.APPLE_PROMO_DISMISSED, analyticsBase);
  };

  const handleShareFallback = async (shareUrl: string) => {
    if (!navigator.clipboard?.writeText) {
      setShareFeedback('Teilen ist in diesem Browser aktuell nicht verfügbar.');
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setShareFeedback('Link wurde in die Zwischenablage kopiert.');
    capture(ANALYTICS_EVENTS.APPLE_PROMO_SHARE_COPY_FALLBACK, analyticsBase);
    await launchShareConfetti();
    markPostShareShown();
  };

  const handleShare = async () => {
    const shareUrl = getShareUrl();
    setShareFeedback(null);

    capture(ANALYTICS_EVENTS.APPLE_PROMO_SHARE_CLICKED, analyticsBase);

    if (typeof navigator.share !== 'function') {
      await handleShareFallback(shareUrl);
      return;
    }

    try {
      await navigator.share({
        title: 'FDS Vertretungsplan',
        text: 'Vertretungsplan der Friedrich-Dessauer-Schule Limburg',
        url: shareUrl,
      });
      capture(ANALYTICS_EVENTS.APPLE_PROMO_SHARE_NATIVE_SUCCESS, analyticsBase);
      await launchShareConfetti();
      markPostShareShown();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      await handleShareFallback(shareUrl);
    }
  };

  return (
    <section className="rounded-xl border border-[rgb(var(--color-border)/0.25)] bg-[rgb(var(--color-surface))] p-3">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-[rgb(var(--color-text))]">Push Notifications</h2>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-md p-1 text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background))]"
          aria-label="Hinweis ausblenden"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">{description}</p>

      {isMobileBrowser && !postShareShown ? (
        <p className="mt-2 text-xs text-[rgb(var(--color-text-secondary))]">
          Öffne „Teilen“ und wähle „Zum Home-Bildschirm“. Öffne danach das neue App-Symbol.
        </p>
      ) : null}

      {isMobileStandalone ? (
        <p className="mt-2 flex items-center gap-2 text-xs text-[rgb(var(--color-text-secondary))]">
          <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
          Home-Bildschirm-App erkannt.
        </p>
      ) : null}

      {isMobileBrowser ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => void handleShare()}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Teilen & Home-Bildschirm
          </Button>
        </div>
      ) : (
        <div className="mt-2">
          <PushOptInCard
            initialEnabled={pushEnabled}
            variant="embedded"
            onEnableStart={() => {
              capture(ANALYTICS_EVENTS.APPLE_PROMO_PUSH_ENABLE_CLICKED, analyticsBase);
            }}
            onEnableSuccess={() => {
              capture(ANALYTICS_EVENTS.APPLE_PROMO_PUSH_ENABLE_SUCCESS, analyticsBase);
              setPushEnabled(true);
            }}
            onEnableError={(message) => {
              capture(ANALYTICS_EVENTS.APPLE_PROMO_PUSH_ENABLE_FAILED, {
                ...analyticsBase,
                message_length: message.length,
              });
            }}
          />
        </div>
      )}

      {shareFeedback ? (
        <p className="mt-2 text-xs text-[rgb(var(--color-text-secondary))]" aria-live="polite">
          {shareFeedback}
        </p>
      ) : null}
    </section>
  );
}
