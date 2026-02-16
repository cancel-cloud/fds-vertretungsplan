'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TimetableEntryInput, WeekMode, Weekday } from '@/types/user-system';
import { validateTimetableEntries } from '@/lib/timetable';

interface LocalEntry extends TimetableEntryInput {
  id: string;
}

interface DurationMenuState {
  weekday: Weekday;
  startPeriod: number;
  x: number;
  y: number;
  preferredWeekMode: WeekMode | null;
}

const WEEKDAY_ORDER: { key: Weekday; label: string }[] = [
  { key: 'MON', label: 'Montag' },
  { key: 'TUE', label: 'Dienstag' },
  { key: 'WED', label: 'Mittwoch' },
  { key: 'THU', label: 'Donnerstag' },
  { key: 'FRI', label: 'Freitag' },
];

const WEEK_MODE_LABELS: Record<WeekMode, string> = {
  ALL: 'Jede Woche',
  EVEN: 'Gerade Woche',
  ODD: 'Ungerade Woche',
};

const PERIODS = Array.from({ length: 16 }, (_, index) => index + 1);

const createLocalId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface TeacherOption {
  code: string;
  fullName: string;
}

interface TimetablePresetOption {
  id: string;
  subjectCode: string;
  teacherCode: string;
  room: string | null;
  usageCount: number;
}

interface TimetableOnboardingProps {
  mode?: 'onboarding' | 'edit';
}

export function TimetableOnboarding({ mode = 'onboarding' }: TimetableOnboardingProps) {
  const router = useRouter();
  const isOnboardingMode = mode === 'onboarding';
  const [entries, setEntries] = useState<LocalEntry[]>([]);
  const [presets, setPresets] = useState<TimetablePresetOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [durationMenu, setDurationMenu] = useState<DurationMenuState | null>(null);
  const durationMenuRef = useRef<HTMLDivElement | null>(null);

  const [selectedWeekday, setSelectedWeekday] = useState<Weekday>('MON');
  const [selectedStartPeriod, setSelectedStartPeriod] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState<1 | 2>(1);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const [visiblePeriodsCount, setVisiblePeriodsCount] = useState(8);

  const [subjectCode, setSubjectCode] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [room, setRoom] = useState('');
  const [weekMode, setWeekMode] = useState<WeekMode>('ALL');

  const sortedEntries = useMemo(
    () =>
      [...entries].sort((left, right) => {
        const dayDiff =
          WEEKDAY_ORDER.findIndex((day) => day.key === left.weekday) -
          WEEKDAY_ORDER.findIndex((day) => day.key === right.weekday);
        if (dayDiff !== 0) {
          return dayDiff;
        }
        return left.startPeriod - right.startPeriod;
      }),
    [entries]
  );

  const displayedPeriods = useMemo(() => PERIODS.slice(0, visiblePeriodsCount), [visiblePeriodsCount]);

  useEffect(() => {
    const load = async () => {
      try {
        const [timetableRes, teachersRes] = await Promise.all([fetch('/api/timetable'), fetch('/api/teachers')]);

        if (timetableRes.status === 401 || teachersRes.status === 401) {
          const nextPath = isOnboardingMode ? '/stundenplan/onboarding' : '/stundenplan/stundenplan';
          router.replace(`/stundenplan/login?next=${encodeURIComponent(nextPath)}`);
          return;
        }

        if (!timetableRes.ok) {
          throw new Error('Stundenplan konnte nicht geladen werden.');
        }

        const timetableData = (await timetableRes.json()) as {
          entries: Array<{
            id: string;
            weekday: Weekday;
            startPeriod: number;
            duration: 1 | 2;
            subjectCode: string;
            teacherCode: string;
            room: string | null;
            weekMode: WeekMode;
          }>;
          presets?: TimetablePresetOption[];
        };

        const loadedEntries = timetableData.entries.map((entry) => ({
          id: entry.id,
          weekday: entry.weekday,
          startPeriod: entry.startPeriod,
          duration: entry.duration,
          subjectCode: entry.subjectCode,
          teacherCode: entry.teacherCode,
          room: entry.room,
          weekMode: entry.weekMode,
        }));

        setEntries(loadedEntries);
        setPresets(timetableData.presets ?? []);

        const maxUsedPeriod = loadedEntries.reduce(
          (maxValue, entry) => Math.max(maxValue, entry.startPeriod + entry.duration - 1),
          8
        );
        setVisiblePeriodsCount(Math.min(16, maxUsedPeriod));

        if (teachersRes.ok) {
          const teacherData = (await teachersRes.json()) as { teachers: TeacherOption[] };
          setTeachers(teacherData.teachers);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Daten konnten nicht geladen werden.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [isOnboardingMode, router]);

  useEffect(() => {
    if (!durationMenu) {
      return;
    }

    const onMouseDown = (event: globalThis.MouseEvent) => {
      if (!durationMenuRef.current) {
        return;
      }

      if (!durationMenuRef.current.contains(event.target as Node)) {
        setDurationMenu(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDurationMenu(null);
      }
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [durationMenu]);

  const getCellEntries = (weekday: Weekday, period: number): LocalEntry[] =>
    sortedEntries.filter((entry) => {
      if (entry.weekday !== weekday) {
        return false;
      }

      const end = entry.startPeriod + entry.duration - 1;
      return period >= entry.startPeriod && period <= end;
    });

  const openDurationMenu = (
    weekday: Weekday,
    startPeriod: number,
    event: ReactMouseEvent<HTMLButtonElement>,
    preferredWeekMode: WeekMode | null
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = 120;

    const x = Math.min(Math.max(8, rect.left), window.innerWidth - menuWidth - 8);
    const y = Math.min(rect.bottom + 8, window.innerHeight - menuHeight - 8);

    setDurationMenu({
      weekday,
      startPeriod,
      x,
      y,
      preferredWeekMode,
    });
    setError(null);
  };

  const resetEntryForm = () => {
    setSubjectCode('');
    setTeacherCode('');
    setRoom('');
    setWeekMode('ALL');
  };

  const startCreateFromMenu = (duration: 1 | 2) => {
    if (!durationMenu) {
      return;
    }

    setEditingEntryId(null);
    setSelectedWeekday(durationMenu.weekday);
    setSelectedStartPeriod(durationMenu.startPeriod);
    setSelectedDuration(duration);
    resetEntryForm();
    setWeekMode(durationMenu.preferredWeekMode ?? 'ALL');
    setDurationMenu(null);
    setEntryDialogOpen(true);
  };

  const startEditEntry = (entry: LocalEntry) => {
    setEditingEntryId(entry.id);
    setSelectedWeekday(entry.weekday);
    setSelectedStartPeriod(entry.startPeriod);
    setSelectedDuration(entry.duration);
    setSubjectCode(entry.subjectCode);
    setTeacherCode(entry.teacherCode);
    setRoom(entry.room ?? '');
    setWeekMode(entry.weekMode);
    setEntryDialogOpen(true);
    setDurationMenu(null);
    setError(null);
  };

  const applyPreset = (preset: TimetablePresetOption) => {
    setSubjectCode(preset.subjectCode);
    setTeacherCode(preset.teacherCode);
    setRoom(preset.room ?? '');
  };

  const saveEntry = () => {
    const normalizedSubjectCode = subjectCode.trim().toUpperCase();
    const normalizedTeacherCode = teacherCode.trim().toUpperCase();
    const normalizedRoom = room.trim();

    const nextEntry: LocalEntry = {
      id: editingEntryId ?? createLocalId(),
      weekday: selectedWeekday,
      startPeriod: selectedStartPeriod,
      duration: selectedDuration,
      subjectCode: normalizedSubjectCode,
      teacherCode: normalizedTeacherCode,
      room: normalizedRoom.length > 0 ? normalizedRoom : null,
      weekMode,
    };

    try {
      const updatedEntries = editingEntryId
        ? entries.map((entry) => (entry.id === editingEntryId ? nextEntry : entry))
        : [...entries, nextEntry];

      validateTimetableEntries(updatedEntries);
      setEntries(updatedEntries);
      setEntryDialogOpen(false);
      setEditingEntryId(null);
      setFeedback(editingEntryId ? 'Eintrag wurde aktualisiert.' : 'Eintrag wurde hinzugefügt.');
      setError(null);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Eintrag ist ungültig.');
    }
  };

  const removeEntry = (entryId: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== entryId));
  };

  const saveEntries = async () => {
    try {
      setIsSaving(true);
      setError(null);
      validateTimetableEntries(entries);

      const response = await fetch('/api/timetable', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: entries.map((entry) => ({
            weekday: entry.weekday,
            startPeriod: entry.startPeriod,
            duration: entry.duration,
            subjectCode: entry.subjectCode,
            teacherCode: entry.teacherCode,
            room: entry.room,
            weekMode: entry.weekMode,
          })),
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Speichern fehlgeschlagen.');
      }

      router.push('/stundenplan/dashboard');
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Speichern fehlgeschlagen.');
    } finally {
      setIsSaving(false);
    }
  };

  const skipOnboarding = async () => {
    const confirmed = window.confirm(
      'Wenn du den Schritt überspringst, bekommst du keine Push-Benachrichtigungen. Trotzdem fortfahren?'
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/timetable', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skipped: true }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Überspringen fehlgeschlagen.');
      }

      router.push('/stundenplan/dashboard');
      router.refresh();
    } catch (skipError) {
      setError(skipError instanceof Error ? skipError.message : 'Überspringen fehlgeschlagen.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-[rgb(var(--color-text-secondary))]">Lade Stundenplan…</p>;
  }

  return (
    <div className="space-y-6">
      {isOnboardingMode ? (
        <div className="rounded-2xl border border-[rgb(var(--color-warning)/0.35)] bg-[rgb(var(--color-warning)/0.08)] p-4 text-sm text-[rgb(var(--color-text))]">
          Du kannst das Onboarding überspringen. Ohne Stundenplan sind persönliche Benachrichtigungen deaktiviert.
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))]">
        <table className="min-w-[900px] w-full border-collapse">
          <thead>
            <tr className="bg-[rgb(var(--color-background)/0.9)]">
              <th className="sticky left-0 z-10 border-b border-r border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] px-3 py-3 text-left text-sm font-semibold">
                Stunde
              </th>
              {WEEKDAY_ORDER.map((day) => (
                <th
                  key={day.key}
                  className="border-b border-[rgb(var(--color-border)/0.2)] px-3 py-3 text-left text-sm font-semibold"
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedPeriods.map((period) => (
              <tr key={period} className="border-b border-[rgb(var(--color-border)/0.15)] last:border-b-0">
                <th className="sticky left-0 z-10 border-r border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] px-3 py-2 text-left text-sm font-medium">
                  {period}
                </th>

                {WEEKDAY_ORDER.map((day) => {
                  const cellEntries = getCellEntries(day.key, period);
                  const hasAll = cellEntries.some((entry) => entry.weekMode === 'ALL');
                  const hasEven = cellEntries.some((entry) => entry.weekMode === 'EVEN');
                  const hasOdd = cellEntries.some((entry) => entry.weekMode === 'ODD');
                  const canAdd = !hasAll && !(hasEven && hasOdd);
                  const preferredWeekMode: WeekMode | null = hasEven && !hasOdd ? 'ODD' : hasOdd && !hasEven ? 'EVEN' : null;

                  return (
                    <td key={`${day.key}-${period}`} className="align-top px-2 py-2">
                      <div className="flex flex-wrap gap-2">
                        {cellEntries.map((entry) => {
                          const isEntryStart = period === entry.startPeriod;
                          const isEntryEnd = period === entry.startPeriod + entry.duration - 1;
                          const isDouble = entry.duration === 2;
                          const widthClass = entry.weekMode === 'ALL' ? 'w-full' : 'w-[calc(50%-0.25rem)]';
                          const shapeClass =
                            isDouble && !isEntryStart
                              ? 'rounded-t-none border-t-0'
                              : isDouble && !isEntryEnd
                                ? 'rounded-b-none border-b-0'
                                : 'rounded-xl';

                          return (
                            <div
                              key={entry.id}
                              className={`${widthClass} border border-[rgb(var(--color-primary)/0.2)] bg-[rgb(var(--color-primary)/0.08)] p-2 ${shapeClass}`}
                            >
                              {isEntryStart ? (
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">{entry.subjectCode}</p>
                                    <p className="truncate text-xs text-[rgb(var(--color-text-secondary))]">{entry.teacherCode}</p>
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                                      {WEEK_MODE_LABELS[entry.weekMode]}
                                    </p>
                                    {entry.room ? (
                                      <p className="truncate text-xs text-[rgb(var(--color-text-secondary))]">Raum {entry.room}</p>
                                    ) : null}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => startEditEntry(entry)}
                                      className="rounded-md p-1 text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background))]"
                                      aria-label="Eintrag bearbeiten"
                                    >
                                      <Pencil className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeEntry(entry.id)}
                                      className="rounded-md p-1 text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background))]"
                                      aria-label="Eintrag löschen"
                                    >
                                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-[2.25rem]" />
                              )}
                            </div>
                          );
                        })}

                        {canAdd ? (
                          <button
                            type="button"
                            onClick={(event) => openDurationMenu(day.key, period, event, preferredWeekMode)}
                            className={`flex h-10 touch-manipulation items-center justify-center rounded-lg border border-dashed border-[rgb(var(--color-border)/0.35)] text-[rgb(var(--color-text-secondary))] transition-colors hover:border-[rgb(var(--color-primary)/0.45)] hover:text-[rgb(var(--color-text))] ${
                              hasEven || hasOdd ? 'w-[calc(50%-0.25rem)]' : 'w-full'
                            }`}
                            aria-label={`${day.label}, Stunde ${period} hinzufügen`}
                          >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visiblePeriodsCount < 16 ? (
        <Button type="button" variant="outline" onClick={() => setVisiblePeriodsCount(16)}>
          Weitere Stunden anzeigen (9-16)
        </Button>
      ) : null}

      {error ? (
        <p
          className="rounded-md bg-[rgb(var(--color-error)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-error))]"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}

      {feedback ? (
        <p
          className="rounded-md bg-[rgb(var(--color-success)/0.12)] px-3 py-2 text-sm text-[rgb(var(--color-success))]"
          aria-live="polite"
        >
          {feedback}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={saveEntries} loading={isSaving}>
          {isOnboardingMode ? 'Stundenplan speichern' : 'Änderungen speichern'}
        </Button>
        {isOnboardingMode ? (
          <Button type="button" variant="outline" onClick={skipOnboarding} disabled={isSaving}>
            Onboarding überspringen
          </Button>
        ) : null}
      </div>

      {durationMenu ? (
        <div
          ref={durationMenuRef}
          className="fixed z-50 w-52 rounded-xl border border-[rgb(var(--color-border)/0.3)] bg-[rgb(var(--color-surface))] p-2 shadow-lg"
          style={{ top: durationMenu.y, left: durationMenu.x }}
          role="dialog"
          aria-label="Stundentyp auswählen"
        >
          <p className="px-2 pb-2 text-xs font-medium text-[rgb(var(--color-text-secondary))]">
            Stunde {durationMenu.startPeriod}: Eintrag anlegen
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => startCreateFromMenu(1)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[rgb(var(--color-background))]"
            >
              Einzelstunde
            </button>
            <button
              type="button"
              onClick={() => startCreateFromMenu(2)}
              disabled={durationMenu.startPeriod === 16}
              className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[rgb(var(--color-background))] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Doppelstunde
            </button>
          </div>
        </div>
      ) : null}

      <Dialog
        open={entryDialogOpen}
        onOpenChange={(open) => {
          setEntryDialogOpen(open);
          if (!open) {
            setEditingEntryId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEntryId ? 'Eintrag bearbeiten' : 'Eintrag hinzufügen'}</DialogTitle>
            <DialogDescription>
              {WEEKDAY_ORDER.find((day) => day.key === selectedWeekday)?.label}, Start Stunde {selectedStartPeriod},
              Dauer {selectedDuration}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {presets.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Vorlagen wiederverwenden</p>
                <div className="flex flex-wrap gap-2">
                  {presets.slice(0, 12).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="rounded-lg border border-[rgb(var(--color-border)/0.3)] bg-[rgb(var(--color-background)/0.75)] px-3 py-1.5 text-left text-xs hover:border-[rgb(var(--color-primary)/0.5)]"
                    >
                      <span className="font-semibold">{preset.subjectCode}</span>{' '}
                      <span className="text-[rgb(var(--color-text-secondary))]">{preset.teacherCode}</span>
                      {preset.room ? (
                        <span className="text-[rgb(var(--color-text-secondary))]"> · {preset.room}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-1">
              <label htmlFor="subject-code" className="text-sm font-medium">
                Fach-Kürzel
              </label>
              <Input
                id="subject-code"
                name="subject-code"
                autoComplete="off"
                spellCheck={false}
                value={subjectCode}
                onChange={(event) => setSubjectCode(event.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="teacher-code" className="text-sm font-medium">
                Lehrer-Kürzel
              </label>
              <Input
                id="teacher-code"
                name="teacher-code"
                list="teacher-codes"
                autoComplete="off"
                spellCheck={false}
                value={teacherCode}
                onChange={(event) => setTeacherCode(event.target.value.toUpperCase())}
                required
              />
              <datalist id="teacher-codes">
                {teachers.map((teacher) => (
                  <option key={teacher.code} value={teacher.code} label={teacher.fullName} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1">
              <label htmlFor="room" className="text-sm font-medium">
                Raum / Location (optional)
              </label>
              <Input id="room" name="room" value={room} onChange={(event) => setRoom(event.target.value)} autoComplete="off" />
            </div>

            <div className="space-y-1">
              <label htmlFor="week-mode" className="text-sm font-medium">
                Wochenmodus
              </label>
              <select
                id="week-mode"
                name="week-mode"
                className="h-9 w-full rounded-md border border-[rgb(var(--color-border)/0.25)] bg-transparent px-3 text-sm"
                value={weekMode}
                onChange={(event) => setWeekMode(event.target.value as WeekMode)}
              >
                <option value="ALL">Jede Woche</option>
                <option value="EVEN">Gerade Woche</option>
                <option value="ODD">Ungerade Woche</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEntryDialogOpen(false);
                setEditingEntryId(null);
              }}
            >
              Abbrechen
            </Button>
            <Button type="button" onClick={saveEntry}>
              {editingEntryId ? 'Änderung speichern' : 'Eintrag speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
