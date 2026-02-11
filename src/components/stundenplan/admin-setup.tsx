'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TeacherItem {
  id: string;
  code: string;
  fullName: string;
  isActive: boolean;
}

export function AdminSetup() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCode, setNewCode] = useState('');
  const [newFullName, setNewFullName] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/teachers');
      const data = (await response.json()) as { teachers?: TeacherItem[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Lehrer konnten nicht geladen werden.');
      }

      setTeachers(data.teachers ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Lehrer konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addTeacher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: newCode,
          fullName: newFullName,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Lehrer konnte nicht angelegt werden.');
      }

      setNewCode('');
      setNewFullName('');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Lehrer konnte nicht angelegt werden.');
    } finally {
      setSaving(false);
    }
  };

  const removeTeacher = async (id: string) => {
    const confirmed = window.confirm('Lehrer wirklich löschen?');
    if (!confirmed) {
      return;
    }

    const response = await fetch('/api/admin/teachers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      await load();
    }
  };

  const continueToOnboarding = () => {
    router.push('/stundenplan/onboarding');
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[rgb(var(--color-warning)/0.35)] bg-[rgb(var(--color-warning)/0.08)] p-4 text-sm text-[rgb(var(--color-text))]">
        Ersteinrichtung: Lege zuerst mindestens einen Lehrer mit Kürzel und vollem Namen an.
      </div>

      <section className="rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5">
        <form className="grid gap-2 md:grid-cols-[180px_1fr_auto]" onSubmit={addTeacher}>
          <div>
            <label htmlFor="setup-code" className="mb-1 block text-sm font-medium">Kürzel</label>
            <Input
              id="setup-code"
              name="setup-code"
              autoComplete="off"
              spellCheck={false}
              value={newCode}
              onChange={(event) => setNewCode(event.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <label htmlFor="setup-name" className="mb-1 block text-sm font-medium">Voller Name</label>
            <Input
              id="setup-name"
              name="setup-name"
              value={newFullName}
              onChange={(event) => setNewFullName(event.target.value)}
              required
            />
          </div>
          <div className="self-end">
            <Button type="submit" loading={saving}>
              Hinzufügen
            </Button>
          </div>
        </form>

        {loading ? <p className="mt-4 text-sm text-[rgb(var(--color-text-secondary))]">Lade Lehrer…</p> : null}

        <div className="mt-4 space-y-2">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="flex items-center justify-between rounded-xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-background)/0.65)] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{teacher.code}</p>
                <p className="truncate text-sm text-[rgb(var(--color-text-secondary))]">{teacher.fullName}</p>
              </div>
              <Button type="button" size="sm" variant="ghost" onClick={() => removeTeacher(teacher.id)}>
                Löschen
              </Button>
            </div>
          ))}
          {!loading && teachers.length === 0 ? (
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Noch keine Lehrer hinterlegt.</p>
          ) : null}
        </div>
      </section>

      {error ? (
        <p className="rounded-md bg-[rgb(var(--color-error)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-error))]" aria-live="polite">
          {error}
        </p>
      ) : null}

      <Button type="button" onClick={continueToOnboarding} disabled={teachers.length === 0 || loading}>
        Weiter zum Onboarding
      </Button>
    </div>
  );
}
