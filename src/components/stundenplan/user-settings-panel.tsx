'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface MeResponseUser {
  notificationsEnabled: boolean;
  notificationLookaheadSchoolDays: number;
}

interface PushDevice {
  id: string;
  endpoint: string;
  userAgent: string | null;
  createdAt: string;
  lastSeenAt: string;
}

const LOOKAHEAD_OPTIONS = [1, 2, 3, 4, 5];

const detectBrowser = (userAgent: string): string => {
  if (/EdgA?|EdgiOS/i.test(userAgent)) {
    return 'Edge';
  }
  if (/FxiOS|Firefox/i.test(userAgent)) {
    return 'Firefox';
  }
  if (/CriOS|Chrome|Chromium/i.test(userAgent)) {
    return 'Chrome';
  }
  if (/Safari/i.test(userAgent) && !/CriOS|Chrome|Chromium|EdgA?|EdgiOS/i.test(userAgent)) {
    return 'Safari';
  }
  return 'Unbekannter Browser';
};

const detectPlatform = (userAgent: string): string => {
  if (/iPhone/i.test(userAgent)) {
    return 'iPhone';
  }
  if (/iPad/i.test(userAgent)) {
    return 'iPad';
  }
  if (/Android/i.test(userAgent)) {
    return 'Android';
  }
  if (/Macintosh|Mac OS X/i.test(userAgent)) {
    return 'macOS';
  }
  if (/Windows/i.test(userAgent)) {
    return 'Windows';
  }
  if (/Linux/i.test(userAgent)) {
    return 'Linux';
  }
  return 'Unbekanntes Gerät';
};

const formatDeviceLabel = (userAgent: string | null): string => {
  if (!userAgent || userAgent.trim().length === 0) {
    return 'Unbekanntes Gerät';
  }

  const browser = detectBrowser(userAgent);
  const platform = detectPlatform(userAgent);
  return `${browser} auf ${platform}`;
};

const formatEndpointHost = (endpoint: string): string => {
  try {
    return new URL(endpoint).hostname;
  } catch {
    return endpoint;
  }
};

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export function UserSettingsPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lookaheadDays, setLookaheadDays] = useState(1);
  const [devices, setDevices] = useState<PushDevice[]>([]);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [devicesMessage, setDevicesMessage] = useState<string | null>(null);
  const [removingDeviceId, setRemovingDeviceId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setDevicesLoading(true);
        setError(null);
        setDevicesError(null);
        setDevicesMessage(null);
        const [response, devicesResponse] = await Promise.all([fetch('/api/me'), fetch('/api/push/subscriptions')]);
        const data = (await response.json()) as { user?: MeResponseUser; error?: string };

        if (!response.ok || !data.user) {
          throw new Error(data.error ?? 'Einstellungen konnten nicht geladen werden.');
        }

        setNotificationsEnabled(data.user.notificationsEnabled);
        setLookaheadDays(data.user.notificationLookaheadSchoolDays);

        if (devicesResponse.ok) {
          const devicesData = (await devicesResponse.json()) as { subscriptions?: PushDevice[] };
          setDevices(Array.isArray(devicesData.subscriptions) ? devicesData.subscriptions : []);
        } else {
          const devicesData = (await devicesResponse.json()) as { error?: string };
          setDevices([]);
          setDevicesError(devicesData.error ?? 'Push-Geräte konnten nicht geladen werden.');
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Einstellungen konnten nicht geladen werden.');
      } finally {
        setLoading(false);
        setDevicesLoading(false);
      }
    };

    void load();
  }, []);

  const removeDevice = async (device: PushDevice) => {
    try {
      setRemovingDeviceId(device.id);
      setDevicesError(null);
      setDevicesMessage(null);

      const response = await fetch('/api/push/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: device.endpoint }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Gerät konnte nicht abgemeldet werden.');
      }

      setDevices((current) => {
        const next = current.filter((entry) => entry.id !== device.id);
        if (next.length === 0) {
          setNotificationsEnabled(false);
        }
        return next;
      });
      setDevicesMessage('Gerät wurde von Push-Benachrichtigungen abgemeldet.');
    } catch (removeError) {
      setDevicesError(removeError instanceof Error ? removeError.message : 'Gerät konnte nicht abgemeldet werden.');
    } finally {
      setRemovingDeviceId(null);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const response = await fetch('/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationsEnabled,
          notificationLookaheadSchoolDays: lookaheadDays,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Einstellungen konnten nicht gespeichert werden.');
      }

      setMessage('Einstellungen gespeichert.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Einstellungen konnten nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-[rgb(var(--color-text-secondary))]">Lade Einstellungen…</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5">
        <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">Benachrichtigungen</h2>
        <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">
          Push wird nur gesendet, wenn sich relevante Vertretungen im Vergleich zum letzten Stand verändert haben.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-[rgb(var(--color-border)/0.2)] px-3 py-2">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(event) => setNotificationsEnabled(event.target.checked)}
              className="h-4 w-4 min-w-4 rounded border border-[rgb(var(--color-border)/0.6)]"
            />
            <span className="text-sm text-[rgb(var(--color-text))]">Benachrichtigungen aktiv</span>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[rgb(var(--color-text))]">
              Benachrichtigungen für nächste Schultage
            </span>
            <select
              value={lookaheadDays}
              onChange={(event) => setLookaheadDays(Number(event.target.value))}
              className="h-9 rounded-md border border-[rgb(var(--color-border)/0.3)] bg-[rgb(var(--color-background))] px-3 text-sm text-[rgb(var(--color-text))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary)/0.5)]"
            >
              {LOOKAHEAD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-4 text-xs text-[rgb(var(--color-text-secondary))]">
          Default: 1 = nächster Schultag. Samstag und Sonntag werden automatisch übersprungen.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" onClick={save} loading={saving}>
            Speichern
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/stundenplan/dashboard')}>
            Zurück zum Dashboard
          </Button>
        </div>

        {message ? (
          <p
            className="mt-4 rounded-md bg-[rgb(var(--color-success)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-success))]"
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
        {error ? (
          <p
            className="mt-4 rounded-md bg-[rgb(var(--color-error)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-error))]"
            aria-live="polite"
          >
            {error}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5">
        <h3 className="text-base font-semibold text-[rgb(var(--color-text))]">Registrierte Push-Geräte</h3>
        <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">
          Diese Geräte sind aktuell mit deinem Account für Push-Benachrichtigungen verbunden.
        </p>

        {devicesLoading ? (
          <p className="mt-3 text-sm text-[rgb(var(--color-text-secondary))]">Lade Geräte…</p>
        ) : null}

        {!devicesLoading && devicesError ? (
          <p
            className="mt-3 rounded-md bg-[rgb(var(--color-error)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-error))]"
            aria-live="polite"
          >
            {devicesError}
          </p>
        ) : null}

        {!devicesLoading && !devicesError && devices.length === 0 ? (
          <p className="mt-3 rounded-md bg-[rgb(var(--color-background)/0.8)] px-3 py-2 text-sm text-[rgb(var(--color-text-secondary))]">
            Keine Push-Geräte registriert.
          </p>
        ) : null}

        {!devicesLoading && !devicesError && devices.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {devices.map((device) => (
              <li
                key={device.id}
                className="rounded-xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-background)/0.6)] px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[rgb(var(--color-text))]">{formatDeviceLabel(device.userAgent)}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    loading={removingDeviceId === device.id}
                    disabled={removingDeviceId !== null && removingDeviceId !== device.id}
                    onClick={() => void removeDevice(device)}
                  >
                    Deaktivieren
                  </Button>
                </div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">Push-Dienst: {formatEndpointHost(device.endpoint)}</p>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                  Zuletzt aktiv: {formatDateTime(device.lastSeenAt)} · Registriert: {formatDateTime(device.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        {devicesMessage ? (
          <p
            className="mt-3 rounded-md bg-[rgb(var(--color-success)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-success))]"
            aria-live="polite"
          >
            {devicesMessage}
          </p>
        ) : null}
      </section>
    </div>
  );
}
