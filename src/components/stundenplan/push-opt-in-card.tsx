'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  activatePushForCurrentDevice,
  deactivatePushForCurrentDevice,
  getExistingPushSubscription,
  isPushSupported,
  persistPushSubscription,
  setNotificationsEnabled,
} from '@/lib/push-client';

interface PushOptInCardProps {
  initialEnabled: boolean;
  variant?: 'default' | 'embedded';
  onEnableStart?: () => void;
  onEnableSuccess?: () => void;
  onEnableError?: (message: string) => void;
}

export function PushOptInCard({
  initialEnabled,
  variant = 'default',
  onEnableStart,
  onEnableSuccess,
  onEnableError,
}: PushOptInCardProps) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const embedded = variant === 'embedded';

  useEffect(() => {
    const isSupported = isPushSupported();
    setSupported(isSupported);

    if (!isSupported) {
      if (!window.isSecureContext) {
        setMessage('Push benötigt HTTPS oder localhost. Öffne die App über https://... oder http://localhost.');
      }
      return;
    }

    const syncSubscriptionState = async () => {
      try {
        const subscription = await getExistingPushSubscription();

        if (!subscription) {
          setEnabled(false);
          if (initialEnabled) {
            await setNotificationsEnabled(false);
          }
          return;
        }

        setEnabled(true);
        await persistPushSubscription(subscription);
      } catch {
        setEnabled(false);
      }
    };

    void syncSubscriptionState();

    return undefined;
  }, [initialEnabled]);

  const enablePush = async () => {
    setBusy(true);
    setMessage(null);
    onEnableStart?.();

    try {
      setMessage('Aktiviere Push-Benachrichtigungen …');
      await activatePushForCurrentDevice();

      setEnabled(true);
      setMessage('Push-Benachrichtigungen sind aktiv.');
      onEnableSuccess?.();
    } catch (error) {
      const fallback = 'Push konnte nicht aktiviert werden.';
      const detail = error instanceof Error ? error.message : fallback;
      setMessage(detail || fallback);
      onEnableError?.(detail || fallback);
    } finally {
      setBusy(false);
    }
  };

  const disablePush = async () => {
    setBusy(true);
    setMessage(null);

    try {
      await deactivatePushForCurrentDevice();
      setEnabled(false);
      setMessage('Push-Benachrichtigungen wurden deaktiviert.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Push konnte nicht deaktiviert werden.');
    } finally {
      setBusy(false);
    }
  };

  if (!supported) {
    return (
      <div className={embedded ? 'text-xs text-[rgb(var(--color-text-secondary))]' : 'rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-4 text-sm text-[rgb(var(--color-text-secondary))]'}>
        Push-Benachrichtigungen sind hier nicht verfügbar. Ursache: unsicherer Kontext (kein HTTPS/localhost) oder fehlende Browser-Unterstützung.
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-4'}>
      {!embedded ? (
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[rgb(var(--color-text))]">Push-Benachrichtigungen</h2>
            <p className="mt-2 text-sm text-[rgb(var(--color-text-secondary))]">
              Erhalte automatische Hinweise, wenn relevante Vertretungen deinen Stundenplan betreffen.
            </p>
          </div>
          {enabled ? <Bell className="h-6 w-6" aria-hidden="true" /> : <BellOff className="h-6 w-6" aria-hidden="true" />}
        </div>
      ) : null}

      <div className={`${embedded ? 'flex flex-wrap gap-2' : 'mt-4 flex flex-wrap gap-2'}`}>
        {enabled ? (
          <Button type="button" size={embedded ? 'sm' : 'default'} variant="outline" onClick={disablePush} loading={busy}>
            Deaktivieren
          </Button>
        ) : (
          <Button type="button" size={embedded ? 'sm' : 'default'} onClick={enablePush} loading={busy}>
            Aktivieren
          </Button>
        )}
      </div>
      {message ? (
        <p
          className={`rounded-md bg-[rgb(var(--color-background)/0.85)] px-3 py-2 text-[rgb(var(--color-text-secondary))] ${
            embedded ? 'mt-2 text-xs' : 'mt-3 text-sm'
          }`}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
