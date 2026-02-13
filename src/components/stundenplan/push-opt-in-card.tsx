'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
};

const uint8ArrayToBase64Url = (value: Uint8Array): string => {
  let binary = '';
  for (let index = 0; index < value.length; index += 1) {
    binary += String.fromCharCode(value[index]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const normalizeBase64Url = (value: string): string => value.replace(/=+$/g, '').trim();

interface PushOptInCardProps {
  initialEnabled: boolean;
}

async function parseJsonSafe(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function PushOptInCard({ initialEnabled }: PushOptInCardProps) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadVapidPublicKey = async (): Promise<string> => {
    const keyResponse = await fetch('/api/push/subscribe');
    const keyData = await parseJsonSafe(keyResponse);
    const vapidPublicKey = typeof keyData.vapidPublicKey === 'string' ? keyData.vapidPublicKey : null;
    if (!keyResponse.ok || !vapidPublicKey) {
      const errorMessage =
        typeof keyData.error === 'string' && keyData.error.length > 0
          ? keyData.error
          : `Push ist aktuell nicht verfügbar (HTTP ${keyResponse.status}).`;
      throw new Error(errorMessage);
    }

    return vapidPublicKey;
  };

  const hasMatchingApplicationServerKey = (subscription: PushSubscription, vapidPublicKey: string): boolean => {
    const serverKeyBuffer = subscription.options?.applicationServerKey;
    if (!serverKeyBuffer) {
      return true;
    }

    const currentKey = uint8ArrayToBase64Url(new Uint8Array(serverKeyBuffer));
    return normalizeBase64Url(currentKey) === normalizeBase64Url(vapidPublicKey);
  };

  const ensureCurrentSubscription = async (): Promise<PushSubscription> => {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    const registration = await navigator.serviceWorker.ready;
    const vapidPublicKey = await loadVapidPublicKey();
    const vapidServerKey = urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource;

    let subscription = await registration.pushManager.getSubscription();
    if (subscription && !hasMatchingApplicationServerKey(subscription, vapidPublicKey)) {
      await fetch('/api/push/unsubscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
      subscription = null;
    }

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidServerKey,
      });
    }

    return subscription;
  };

  useEffect(() => {
    const isSecure = window.isSecureContext;
    const isSupported = isSecure && 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(isSupported);

    if (!isSupported) {
      if (!isSecure) {
        setMessage('Push benötigt HTTPS oder localhost. Öffne die App über https://... oder http://localhost.');
      }
      return;
    }

    const syncSubscriptionState = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          setEnabled(false);
          if (initialEnabled) {
            await fetch('/api/me', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notificationsEnabled: false }),
            });
          }
          return;
        }

        setEnabled(true);
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
      } catch {
        setEnabled(false);
      }
    };

    void syncSubscriptionState();

    return undefined;
  }, [initialEnabled]);

  const ensureNotificationPermission = async (): Promise<boolean> => {
    if (!window.isSecureContext) {
      setMessage('Push benötigt HTTPS oder localhost. Die aktuelle Seite ist kein sicherer Kontext.');
      return false;
    }

    if (!('Notification' in window)) {
      setMessage('Dieser Browser unterstützt keine Benachrichtigungs-Permissions.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return true;
      }
      if (permission === 'default') {
        setMessage(
          'Chrome/Arc hat den Prompt nicht angezeigt (Quiet UI oder geschlossen). Bitte Website-Benachrichtigungen manuell auf "Zulassen" setzen.'
        );
        return false;
      }
    }

    setMessage(
      'Benachrichtigungen sind im Browser blockiert. In Chrome: Schloss-Symbol -> Website-Einstellungen -> Benachrichtigungen -> Zulassen.'
    );
    return false;
  };

  const enablePush = async () => {
    setBusy(true);
    setMessage(null);

    try {
      setMessage('Prüfe Browser-Permission …');
      const hasPermission = await ensureNotificationPermission();
      if (!hasPermission) {
        return;
      }

      setMessage('Registriere Service Worker …');
      const subscription = await ensureCurrentSubscription();

      setMessage('Speichere Subscription …');
      const subscribeResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      const subscribeData = await parseJsonSafe(subscribeResponse);
      if (!subscribeResponse.ok) {
        const errorMessage =
          typeof subscribeData.error === 'string' && subscribeData.error.length > 0
            ? subscribeData.error
            : `Push konnte nicht aktiviert werden (HTTP ${subscribeResponse.status}).`;
        throw new Error(errorMessage);
      }

      await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationsEnabled: true }),
      });

      setEnabled(true);
      setMessage('Push-Benachrichtigungen sind aktiv.');
    } catch (error) {
      const fallback = 'Push konnte nicht aktiviert werden.';
      const detail = error instanceof Error ? error.message : fallback;
      setMessage(detail || fallback);
    } finally {
      setBusy(false);
    }
  };

  const disablePush = async () => {
    setBusy(true);
    setMessage(null);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();

      if (subscription) {
        await fetch('/api/push/unsubscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }

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
      <div className="rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-4 text-sm text-[rgb(var(--color-text-secondary))]">
        Push-Benachrichtigungen sind hier nicht verfügbar. Ursache: unsicherer Kontext (kein HTTPS/localhost) oder fehlende Browser-Unterstützung.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text))]">Push-Benachrichtigungen</h2>
          <p className="mt-2 text-sm text-[rgb(var(--color-text-secondary))]">
            Erhalte automatische Hinweise, wenn relevante Vertretungen deinen Stundenplan betreffen.
          </p>
        </div>
        {enabled ? <Bell className="h-6 w-8" aria-hidden="true" /> : <BellOff className="h-6 w-8" aria-hidden="true" />}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {enabled ? (
          <Button type="button" variant="outline" onClick={disablePush} loading={busy}>
            Deaktivieren
          </Button>
        ) : (
          <Button type="button" onClick={enablePush} loading={busy}>
            Aktivieren
          </Button>
        )}
      </div>
      {message ? (
        <p
          className="mt-3 rounded-md bg-[rgb(var(--color-background)/0.85)] px-3 py-2 text-sm text-[rgb(var(--color-text-secondary))]"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
