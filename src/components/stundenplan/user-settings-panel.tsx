'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface MeResponseUser {
  notificationsEnabled: boolean;
  notificationLookaheadSchoolDays: number;
}

const LOOKAHEAD_OPTIONS = [1, 2, 3, 4, 5];

export function UserSettingsPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lookaheadDays, setLookaheadDays] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/me');
        const data = (await response.json()) as { user?: MeResponseUser; error?: string };

        if (!response.ok || !data.user) {
          throw new Error(data.error ?? 'Einstellungen konnten nicht geladen werden.');
        }

        setNotificationsEnabled(data.user.notificationsEnabled);
        setLookaheadDays(data.user.notificationLookaheadSchoolDays);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Einstellungen konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

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
        <h3 className="text-base font-semibold text-[rgb(var(--color-text))]">Push-Geräte verwalten</h3>
        <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">
          Geräte-Registrierung und Testversand findest du im Dashboard.
        </p>
        <div className="mt-3">
          <Button type="button" variant="outline" onClick={() => router.push('/stundenplan/dashboard')}>
            Zum Push-Bereich
          </Button>
        </div>
      </section>
    </div>
  );
}
