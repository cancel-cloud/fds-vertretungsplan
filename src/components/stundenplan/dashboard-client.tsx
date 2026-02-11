'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { formatDateForApi } from '@/lib/utils';
import { useSubstitutions } from '@/hooks/use-substitutions';
import { useSubstitutionPolling } from '@/hooks/use-substitution-polling';
import { findRelevantSubstitutions, TimetableMatchEntry } from '@/lib/schedule-matching';
import { SubstitutionCard } from '@/components/substitution-card';
import { Button } from '@/components/ui/button';
import { PushOptInCard } from '@/components/stundenplan/push-opt-in-card';
import { WeekMode, Weekday } from '@/types/user-system';

interface UserData {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  onboardingCompletedAt: string | null;
  onboardingSkippedAt: string | null;
  notificationsEnabled: boolean;
  notificationLookaheadSchoolDays: number;
}

interface TimetableEntryResponse {
  id: string;
  weekday: Weekday;
  startPeriod: number;
  duration: 1 | 2;
  subjectCode: string;
  teacherCode: string;
  room: string | null;
  weekMode: WeekMode;
}

const parseDateParam = (value: string | null): Date | null => {
  if (!value || !/^\d{8}$/.test(value)) {
    return null;
  }

  const year = Number.parseInt(value.slice(0, 4), 10);
  const month = Number.parseInt(value.slice(4, 6), 10) - 1;
  const day = Number.parseInt(value.slice(6, 8), 10);
  const date = new Date(year, month, day);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

export function DashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const queryDateParam = searchParams.get('date');
  const fromPush = searchParams.get('fromPush') === '1';
  const queryDate = useMemo(() => parseDateParam(queryDateParam), [queryDateParam]);

  const [selectedDate, setSelectedDate] = useState<Date>(() => queryDate ?? new Date());
  const [entries, setEntries] = useState<TimetableMatchEntry[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingTimetable, setLoadingTimetable] = useState(true);
  const [timetableError, setTimetableError] = useState<string | null>(null);

  const { substitutions, isLoading, error, refetch } = useSubstitutions(selectedDate);

  useEffect(() => {
    if (!queryDate) {
      return;
    }

    const normalizedQueryDate = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate());
    const normalizedSelectedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );

    if (normalizedQueryDate.getTime() !== normalizedSelectedDate.getTime()) {
      setSelectedDate(normalizedQueryDate);
    }
  }, [queryDate, selectedDate]);

  useEffect(() => {
    if (!fromPush || queryDate) {
      return;
    }

    let active = true;

    const resolveTargetDate = async () => {
      try {
        const response = await fetch('/api/push/last-target');
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { targetDate: number | null };
        if (!active) {
          return;
        }

        const params = new URLSearchParams(searchParamsString);
        params.delete('fromPush');

        if (typeof data.targetDate === 'number') {
          const target = parseDateParam(String(data.targetDate));
          if (target) {
            const normalized = new Date(target.getFullYear(), target.getMonth(), target.getDate());
            setSelectedDate(normalized);
            params.set('date', formatDateForApi(normalized));
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            return;
          }
        }

        router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
      } catch {
        // Keep current view if lookup fails.
      }
    };

    void resolveTargetDate();

    return () => {
      active = false;
    };
  }, [fromPush, pathname, queryDate, router, searchParamsString]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingTimetable(true);
        setTimetableError(null);

        const [meResponse, timetableResponse] = await Promise.all([fetch('/api/me'), fetch('/api/timetable')]);

        if (meResponse.status === 401 || timetableResponse.status === 401) {
          router.replace('/stundenplan/login?next=%2Fstundenplan%2Fdashboard');
          return;
        }

        if (!meResponse.ok || !timetableResponse.ok) {
          throw new Error('Persönliche Daten konnten nicht geladen werden.');
        }

        const meData = (await meResponse.json()) as { user: UserData };
        const timetableData = (await timetableResponse.json()) as { entries: TimetableEntryResponse[] };

        setUser(meData.user);
        setEntries(
          timetableData.entries.map((entry) => ({
            id: entry.id,
            weekday: entry.weekday,
            startPeriod: entry.startPeriod,
            duration: entry.duration,
            subjectCode: entry.subjectCode,
            teacherCode: entry.teacherCode,
            room: entry.room,
            weekMode: entry.weekMode,
          }))
        );
      } catch (loadError) {
        setTimetableError(loadError instanceof Error ? loadError.message : 'Daten konnten nicht geladen werden.');
      } finally {
        setLoadingTimetable(false);
      }
    };

    void load();
  }, [router]);

  const pollingEnabled =
    process.env.NEXT_PUBLIC_ENABLE_FOREGROUND_POLLING_NOTIFICATIONS === 'true' &&
    Boolean(user?.notificationsEnabled) &&
    entries.length > 0 &&
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted';

  useSubstitutionPolling({
    userId: user?.id ?? null,
    entries,
    enabled: pollingEnabled,
  });

  const relevantMatches = useMemo(
    () => findRelevantSubstitutions(substitutions, entries, selectedDate),
    [substitutions, entries, selectedDate]
  );

  const setDate = (date: Date) => {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDate(normalized);

    const params = new URLSearchParams(searchParams.toString());
    params.set('date', formatDateForApi(normalized));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const shiftDate = (offset: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + offset);
    setDate(nextDate);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--color-text))]">Persönliche Vertretungen</h1>
            <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">
              Nur Änderungen, die zu deinem hinterlegten Stundenplan passen.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/stundenplan/stundenplan')}>
              Stundenplan bearbeiten
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/stundenplan/settings')}>
              Einstellungen
            </Button>
            {user?.role === 'ADMIN' ? (
              <Button type="button" variant="outline" onClick={() => router.push('/stundenplan/admin')}>
                Admin
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                void signOut({ callbackUrl: '/stundenplan/login' });
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => shiftDate(-1)}>
            Zurück
          </Button>
          <Button type="button" variant="outline" onClick={() => setDate(new Date())}>
            Heute
          </Button>
          <Button type="button" variant="outline" onClick={() => shiftDate(1)}>
            Weiter
          </Button>
          <p className="ml-2 text-sm text-[rgb(var(--color-text-secondary))]">
            {selectedDate.toLocaleDateString('de-DE', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </p>
        </div>
      </section>

      {user ? <PushOptInCard initialEnabled={user.notificationsEnabled} /> : null}

      {loadingTimetable ? (
        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Lade Stundenplan…</p>
      ) : timetableError ? (
        <p className="rounded-md bg-[rgb(var(--color-error)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-error))]" aria-live="polite">
          {timetableError}
        </p>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-[rgb(var(--color-warning)/0.35)] bg-[rgb(var(--color-warning)/0.08)] p-5">
          <p className="text-sm text-[rgb(var(--color-text))]">
            Kein Stundenplan hinterlegt. Ohne Stundenplan sind keine personalisierten Treffer und keine Push-Benachrichtigungen möglich.
          </p>
          <div className="mt-3">
            <Link href="/stundenplan/stundenplan" className="text-sm font-medium text-[rgb(var(--color-primary))] hover:underline">
              Stundenplan bearbeiten
            </Link>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-[rgb(var(--color-error)/0.25)] bg-[rgb(var(--color-error)/0.08)] p-5">
          <p className="text-sm text-[rgb(var(--color-error))]">{error}</p>
          <Button type="button" className="mt-3" variant="outline" onClick={refetch}>
            Erneut laden
          </Button>
        </div>
      ) : null}

      {!error && !isLoading && entries.length > 0 ? (
        relevantMatches.length > 0 ? (
          <div className="space-y-4">
            {relevantMatches.map((match, index) => (
              <SubstitutionCard
                key={`${match.substitution.group}-${match.substitution.hours}-${match.substitution.subject}-${index}`}
                substitution={match.substitution}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-8 text-center">
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              Für dieses Datum wurden keine relevanten Vertretungen gefunden.
            </p>
          </div>
        )
      ) : null}
    </div>
  );
}
