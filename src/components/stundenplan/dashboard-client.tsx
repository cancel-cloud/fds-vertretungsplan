'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { AlertCircle, Calendar, CalendarDays, Loader2 } from 'lucide-react';
import { formatDateForApi } from '@/lib/utils';
import { useSubstitutions } from '@/hooks/use-substitutions';
import { useSubstitutionPolling } from '@/hooks/use-substitution-polling';
import { findRelevantSubstitutions, TimetableMatchEntry } from '@/lib/schedule-matching';
import { SubstitutionCard } from '@/components/substitution-card';
import { CalendarWidget } from '@/components/calendar-widget';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

const normalizeToDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSchoolDay = (date: Date): boolean => {
  const day = date.getDay();
  return day >= 1 && day <= 5;
};

const normalizeToSchoolDay = (date: Date, direction: 1 | -1 = 1): Date => {
  const normalized = normalizeToDay(date);
  if (isSchoolDay(normalized)) {
    return normalized;
  }

  while (!isSchoolDay(normalized)) {
    normalized.setDate(normalized.getDate() + direction);
  }

  return normalized;
};

const addSchoolDays = (date: Date, offset: number): Date => {
  const result = normalizeToDay(date);
  const direction = offset >= 0 ? 1 : -1;
  let remaining = Math.abs(offset);

  while (remaining > 0) {
    result.setDate(result.getDate() + direction);
    if (isSchoolDay(result)) {
      remaining -= 1;
    }
  }

  return result;
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatChipDate = (date: Date): string =>
  date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });

const formatLongDate = (date: Date): string =>
  date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

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

  const [selectedDate, setSelectedDate] = useState<Date>(() => normalizeToSchoolDay(queryDate ?? new Date(), 1));
  const [entries, setEntries] = useState<TimetableMatchEntry[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingTimetable, setLoadingTimetable] = useState(true);
  const [timetableError, setTimetableError] = useState<string | null>(null);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);

  const { substitutions, isLoading, error, metaResponse, refetch } = useSubstitutions(selectedDate);

  useEffect(() => {
    if (!queryDate) {
      return;
    }

    const normalizedQueryDate = normalizeToSchoolDay(queryDate, 1);
    setSelectedDate((previous) => {
      const normalizedPrevious = normalizeToDay(previous);
      if (normalizedPrevious.getTime() === normalizedQueryDate.getTime()) {
        return previous;
      }
      return normalizedQueryDate;
    });
  }, [queryDate]);

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
            const normalized = normalizeToSchoolDay(target, 1);
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
    const normalized = normalizeToSchoolDay(date, 1);
    setSelectedDate(normalized);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('fromPush');
    params.set('date', formatDateForApi(normalized));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const schoolToday = useMemo(() => normalizeToSchoolDay(new Date(), 1), []);
  const schoolYesterday = useMemo(() => addSchoolDays(schoolToday, -1), [schoolToday]);
  const schoolTomorrow = useMemo(() => addSchoolDays(schoolToday, 1), [schoolToday]);
  const quickDateStrip = useMemo(
    () => [schoolYesterday, schoolToday, schoolTomorrow],
    [schoolYesterday, schoolToday, schoolTomorrow]
  );
  const formattedSelectedDate = formatLongDate(selectedDate);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_300px_at_0%_0%,rgb(var(--color-primary)/0.14),transparent_70%),radial-gradient(900px_300px_at_100%_10%,rgb(var(--color-secondary)/0.14),transparent_75%)]" />
        <div className="relative space-y-5 p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-[rgb(var(--color-text))] md:text-4xl">
                Vertretungsplan
              </h1>
              <p className="text-sm uppercase tracking-[0.14em] text-[rgb(var(--color-text-secondary))]">
                Schnellansicht
              </p>
              <p className="pt-1 text-sm text-[rgb(var(--color-text-secondary))]">
                Nur Änderungen, die zu deinem hinterlegten Stundenplan passen.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="md:hidden" onClick={() => setIsMobileCalendarOpen(true)}>
                <CalendarDays className="mr-1 h-4 w-4" aria-hidden="true" />
                Kalender
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-background)/0.75)] px-4 py-3">
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Ausgewähltes Datum</p>
            <p className="text-lg font-medium text-[rgb(var(--color-text))]">{formattedSelectedDate}</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {quickDateStrip.map((date) => {
              const selected = isSameDay(date, selectedDate);
              return (
                <Button
                  key={date.toISOString()}
                  variant={selected ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 shrink-0 px-3 text-xs touch-manipulation"
                  onClick={() => setDate(date)}
                  aria-pressed={selected}
                >
                  {formatChipDate(date)}
                </Button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
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
      </section>

      <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Card className="sticky top-[88px] space-y-4 border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[rgb(var(--color-text-secondary))]">
              Datum wählen
            </h2>
            <CalendarWidget selectedDate={selectedDate} onDateSelect={setDate} />
          </Card>
        </aside>

        <div className="space-y-6">
          {user ? <PushOptInCard initialEnabled={user.notificationsEnabled} /> : null}

          {loadingTimetable ? (
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Lade Stundenplan…</p>
          ) : timetableError ? (
            <p
              className="rounded-md bg-[rgb(var(--color-error)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-error))]"
              aria-live="polite"
            >
              {timetableError}
            </p>
          ) : entries.length === 0 ? (
            <div className="rounded-2xl border border-[rgb(var(--color-warning)/0.35)] bg-[rgb(var(--color-warning)/0.08)] p-5">
              <p className="text-sm text-[rgb(var(--color-text))]">
                Kein Stundenplan hinterlegt. Ohne Stundenplan sind keine personalisierten Treffer und keine
                Push-Benachrichtigungen möglich.
              </p>
              <div className="mt-3">
                <Link
                  href="/stundenplan/stundenplan"
                  className="text-sm font-medium text-[rgb(var(--color-primary))] hover:underline"
                >
                  Stundenplan bearbeiten
                </Link>
              </div>
            </div>
          ) : null}

          {!timetableError && entries.length > 0 ? (
            <>
              {error ? (
                <Card className="border-[rgb(var(--color-error)/0.25)] bg-[rgb(var(--color-surface))] p-8">
                  <div className="space-y-4 text-center">
                    <div className="flex justify-center">
                      <AlertCircle className="h-10 w-10 text-[rgb(var(--color-error))]" aria-hidden="true" />
                    </div>
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">Fehler beim Laden</h2>
                    <p className="mx-auto max-w-lg text-[rgb(var(--color-text-secondary))]">{error}</p>
                    <Button type="button" onClick={refetch} variant="outline">
                      Erneut versuchen
                    </Button>
                  </div>
                </Card>
              ) : isLoading ? (
                <Card className="border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-12">
                  <div className="flex items-center justify-center gap-3 text-[rgb(var(--color-text-secondary))]">
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span>Vertretungen werden geladen…</span>
                  </div>
                </Card>
              ) : metaResponse ? (
                <Card className="border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-12">
                  <div className="space-y-3 text-center">
                    <div className="flex justify-center">
                      <Calendar className="h-10 w-10 text-[rgb(var(--color-text-secondary))]" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Kein Vertretungsplan verfügbar</h3>
                    <p className="mx-auto max-w-lg text-[rgb(var(--color-text-secondary))]">{metaResponse.message}</p>
                  </div>
                </Card>
              ) : relevantMatches.length > 0 ? (
                <div className="space-y-4">
                  {relevantMatches.map((match, index) => (
                    <SubstitutionCard
                      key={`${match.substitution.group}-${match.substitution.hours}-${match.substitution.subject}-${index}`}
                      substitution={match.substitution}
                    />
                  ))}
                </div>
              ) : substitutions.length > 0 ? (
                <Card className="border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-12">
                  <div className="space-y-3 text-center">
                    <div className="flex justify-center">
                      <Calendar className="h-10 w-10 text-[rgb(var(--color-text-secondary))]" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Keine passenden Vertretungen</h3>
                    <p className="mx-auto max-w-lg text-[rgb(var(--color-text-secondary))]">
                      Für deinen Stundenplan wurden keine passenden Vertretungen gefunden.
                    </p>
                  </div>
                </Card>
              ) : (
                <Card className="border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-12">
                  <div className="space-y-3 text-center">
                    <div className="flex justify-center">
                      <Calendar className="h-10 w-10 text-[rgb(var(--color-text-secondary))]" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Keine Vertretungen</h3>
                    <p className="mx-auto max-w-lg text-[rgb(var(--color-text-secondary))]">
                      Für diesen Tag sind keine Vertretungen eingetragen.
                    </p>
                  </div>
                </Card>
              )}
            </>
          ) : null}
        </div>
      </div>

      <Dialog open={isMobileCalendarOpen} onOpenChange={setIsMobileCalendarOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Datum wählen</DialogTitle>
            <DialogDescription>Schnell zu einem anderen Tag wechseln.</DialogDescription>
          </DialogHeader>
          <CalendarWidget
            selectedDate={selectedDate}
            onDateSelect={(date) => {
              setDate(date);
              setIsMobileCalendarOpen(false);
            }}
            className="w-full"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
