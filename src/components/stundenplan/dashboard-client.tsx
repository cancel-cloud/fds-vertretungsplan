'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Calendar, CalendarDays, Loader2 } from 'lucide-react';
import { formatDateForApi } from '@/lib/utils';
import { useSubstitutions } from '@/hooks/use-substitutions';
import { useSubstitutionPolling } from '@/hooks/use-substitution-polling';
import { findRelevantSubstitutions, TimetableMatchEntry } from '@/lib/schedule-matching';
import { filterSubstitutions } from '@/lib/data-processing';
import { SubstitutionCard } from '@/components/substitution-card';
import { CalendarWidget } from '@/components/calendar-widget';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PushOptInCard } from '@/components/stundenplan/push-opt-in-card';
import { DashboardScope, DASHBOARD_SCOPE_PARAM, parseDashboardScope } from '@/lib/dashboard-scope';
import { WeekMode, Weekday } from '@/types/user-system';

interface DashboardClientProps {
  initialScope: DashboardScope;
  isAuthenticated: boolean;
}

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

export function DashboardClient({ initialScope, isAuthenticated }: DashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const queryDateParam = searchParams.get('date');
  const queryScopeParam = searchParams.get(DASHBOARD_SCOPE_PARAM);
  const querySearchParam = searchParams.get('search') ?? '';
  const fromPush = searchParams.get('fromPush') === '1';

  const queryDate = useMemo(() => parseDateParam(queryDateParam), [queryDateParam]);
  const queryScope = useMemo(() => parseDashboardScope(queryScopeParam), [queryScopeParam]);

  const [scope, setScope] = useState<DashboardScope>(initialScope);
  const [searchQuery, setSearchQuery] = useState(querySearchParam);
  const [selectedDate, setSelectedDate] = useState<Date>(() => normalizeToSchoolDay(queryDate ?? new Date(), 1));
  const [entries, setEntries] = useState<TimetableMatchEntry[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingTimetable, setLoadingTimetable] = useState(initialScope === 'personal' && isAuthenticated);
  const [timetableError, setTimetableError] = useState<string | null>(null);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);

  const { substitutions, isLoading, error, metaResponse, refetch } = useSubstitutions(selectedDate);

  const isPersonalScope = scope === 'personal';

  useEffect(() => {
    if (scope !== queryScope) {
      setScope(queryScope);
    }
  }, [queryScope, scope]);

  useEffect(() => {
    if (searchQuery !== querySearchParam) {
      setSearchQuery(querySearchParam);
    }
  }, [querySearchParam, searchQuery]);

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
    if (!isPersonalScope || !isAuthenticated || !fromPush || queryDate) {
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
        params.set(DASHBOARD_SCOPE_PARAM, 'personal');

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
  }, [fromPush, isAuthenticated, isPersonalScope, pathname, queryDate, router, searchParamsString]);

  useEffect(() => {
    if (!isPersonalScope || !isAuthenticated) {
      setUser(null);
      setEntries([]);
      setTimetableError(null);
      setLoadingTimetable(false);
      return;
    }

    const load = async () => {
      try {
        setLoadingTimetable(true);
        setTimetableError(null);

        const [meResponse, timetableResponse] = await Promise.all([fetch('/api/me'), fetch('/api/timetable')]);
        if (meResponse.status === 401 || timetableResponse.status === 401) {
          const nextPath = `${pathname}${searchParamsString ? `?${searchParamsString}` : ''}`;
          router.replace(`/stundenplan/login?next=${encodeURIComponent(nextPath)}`);
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
  }, [isAuthenticated, isPersonalScope, pathname, router, searchParamsString]);

  const pollingEnabled =
    isPersonalScope &&
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
    () => (isPersonalScope ? findRelevantSubstitutions(substitutions, entries, selectedDate) : []),
    [entries, isPersonalScope, selectedDate, substitutions]
  );

  const visibleSubstitutions = useMemo(
    () => (isPersonalScope ? relevantMatches.map((match) => match.substitution) : substitutions),
    [isPersonalScope, relevantMatches, substitutions]
  );
  const filteredVisibleSubstitutions = useMemo(
    () => filterSubstitutions(visibleSubstitutions, { search: searchQuery, categories: [] }),
    [searchQuery, visibleSubstitutions]
  );
  const hasSearchActive = searchQuery.trim().length > 0;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('fromPush');

    if (value.trim()) {
      params.set('search', value);
    } else {
      params.delete('search');
    }

    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  };

  const setDate = (date: Date, targetScope = scope) => {
    const normalized = normalizeToSchoolDay(date, 1);
    setSelectedDate(normalized);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('fromPush');
    params.set('date', formatDateForApi(normalized));
    params.set(DASHBOARD_SCOPE_PARAM, targetScope);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setScopeAndSync = (nextScope: DashboardScope) => {
    if (nextScope === scope) {
      return;
    }

    if (nextScope === 'personal' && !isAuthenticated) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('fromPush');
      params.set('date', formatDateForApi(normalizeToSchoolDay(selectedDate, 1)));
      params.set(DASHBOARD_SCOPE_PARAM, 'personal');
      const nextPath = `${pathname}?${params.toString()}`;
      router.push(`/stundenplan/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    setScope(nextScope);
    setDate(selectedDate, nextScope);
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
    <div className="grid gap-6">
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
                {isPersonalScope
                  ? 'Nur Änderungen, die zu deinem hinterlegten Stundenplan passen.'
                  : 'Alle Vertretungen des ausgewählten Tages.'}
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

          <SearchInput value={searchQuery} onChange={handleSearchChange} />

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

        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Card className="sticky top-[88px] space-y-4 border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-4">
            <CalendarWidget selectedDate={selectedDate} onDateSelect={setDate} />
            {isPersonalScope && user ? <PushOptInCard initialEnabled={user.notificationsEnabled} /> : null}
          </Card>
        </aside>

        <div className="grid content-start gap-4">
          <section className="rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-[rgb(var(--color-text))]">Ansicht</h2>
                <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">
                  {isPersonalScope
                    ? 'Nur Vertretungen passend zu deinem Stundenplan.'
                    : 'Alle Vertretungen für den ausgewählten Tag.'}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-background)/0.75)] p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={scope === 'personal' ? 'default' : 'ghost'}
                  className="h-8 touch-manipulation"
                  onClick={() => setScopeAndSync('personal')}
                  aria-pressed={scope === 'personal'}
                >
                  Meine Vertretungen
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={scope === 'all' ? 'default' : 'ghost'}
                  className="h-8 touch-manipulation"
                  onClick={() => setScopeAndSync('all')}
                  aria-pressed={scope === 'all'}
                >
                  Alle Vertretungen
                </Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-[rgb(var(--color-text-secondary))]">
              Diese Auswahl bleibt im Link erhalten und kann direkt geteilt werden.
            </p>
          </section>

          <div className="grid min-h-[180px] content-start gap-4">
            {isPersonalScope && loadingTimetable ? (
              <Card className="border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-12">
                <div className="flex items-center justify-center gap-3 text-[rgb(var(--color-text-secondary))]">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  <span>Lade Stundenplan…</span>
                </div>
              </Card>
            ) : null}

            {isPersonalScope && timetableError ? (
              <p
                className="rounded-md bg-[rgb(var(--color-error)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-error))]"
                aria-live="polite"
              >
                {timetableError}
              </p>
            ) : null}

            {isPersonalScope && !timetableError && !loadingTimetable && entries.length === 0 ? (
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

            {(!isPersonalScope || (!loadingTimetable && !timetableError && entries.length > 0)) && (
              <>
                <div className="rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-[rgb(var(--color-text))]">
                        Vertretungen für {formattedSelectedDate}
                      </h2>
                      <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">
                        {hasSearchActive
                          ? `${filteredVisibleSubstitutions.length} von ${visibleSubstitutions.length} Einträgen sichtbar`
                          : isPersonalScope
                          ? `${visibleSubstitutions.length} relevante Einträge`
                          : `${substitutions.length} Einträge`}
                      </p>
                    </div>
                  </div>
                </div>

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
                ) : filteredVisibleSubstitutions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredVisibleSubstitutions.map((substitution, index) => (
                      <SubstitutionCard
                        key={`${substitution.group}-${substitution.hours}-${substitution.subject}-${index}`}
                        substitution={substitution}
                      />
                    ))}
                  </div>
                ) : hasSearchActive && visibleSubstitutions.length > 0 ? (
                  <Card className="border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-12">
                    <div className="space-y-3 text-center">
                      <div className="flex justify-center">
                        <Calendar className="h-10 w-10 text-[rgb(var(--color-text-secondary))]" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Keine passenden Vertretungen</h3>
                      <p className="mx-auto max-w-lg text-[rgb(var(--color-text-secondary))]">
                        Mit dem aktuellen Suchbegriff wurden keine Vertretungen gefunden.
                      </p>
                    </div>
                  </Card>
                ) : substitutions.length > 0 && isPersonalScope ? (
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
            )}
          </div>
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
          {isPersonalScope && user ? <PushOptInCard initialEnabled={user.notificationsEnabled} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
