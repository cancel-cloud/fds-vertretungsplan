'use client';

import { type KeyboardEvent, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startOfLocalDay, isSameDay } from '@/lib/date-utils';

interface CalendarDate {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  isOtherMonth: boolean;
  isWeekend: boolean;
}

interface CalendarWidgetProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
  enableAdvancedFeatures?: boolean;
}

const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const normalizeSchoolDay = (date: Date, direction: 'forward' | 'backward' = 'forward') => {
  const normalized = new Date(date);

  while (isWeekend(normalized)) {
    normalized.setDate(normalized.getDate() + (direction === 'forward' ? 1 : -1));
  }

  return normalized;
};

const toDateId = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export function CalendarWidget({
  selectedDate,
  onDateSelect,
  className = '',
  enableAdvancedFeatures = true,
}: CalendarWidgetProps) {
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const today = useMemo(() => startOfLocalDay(new Date()), []);

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const calendarDates = useMemo<CalendarDate[]>(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startingDay = firstDayOfMonth.getDay() || 7;
    const totalDays = lastDayOfMonth.getDate();

    const dates: CalendarDate[] = [];

    const prevMonthDays = startingDay - 1;
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

    for (let index = prevMonthDays; index > 0; index -= 1) {
      const day = prevMonthLastDay - index + 1;
      const date = new Date(currentYear, currentMonth - 1, day);
      dates.push({
        date,
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDate),
        isOtherMonth: true,
        isWeekend: isWeekend(date),
      });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(currentYear, currentMonth, day);
      dates.push({
        date,
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDate),
        isOtherMonth: false,
        isWeekend: isWeekend(date),
      });
    }

    const remainingCells = 42 - dates.length;
    for (let day = 1; day <= remainingCells; day += 1) {
      const date = new Date(currentYear, currentMonth + 1, day);
      dates.push({
        date,
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDate),
        isOtherMonth: true,
        isWeekend: isWeekend(date),
      });
    }

    return dates;
  }, [currentMonth, currentYear, selectedDate, today]);

  const handleDateSelect = (date: Date, direction: 'forward' | 'backward' = 'forward') => {
    const normalized = normalizeSchoolDay(startOfLocalDay(date), direction);
    onDateSelect(normalized);
    setViewDate(new Date(normalized.getFullYear(), normalized.getMonth(), 1));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewDate((previous) =>
      direction === 'prev'
        ? new Date(previous.getFullYear(), previous.getMonth() - 1, 1)
        : new Date(previous.getFullYear(), previous.getMonth() + 1, 1)
    );
  };

  const handleDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    if (!enableAdvancedFeatures) {
      return;
    }

    let offset = 0;
    if (event.key === 'ArrowRight') offset = 1;
    if (event.key === 'ArrowLeft') offset = -1;
    if (event.key === 'ArrowDown') offset = 7;
    if (event.key === 'ArrowUp') offset = -7;

    if (offset !== 0) {
      event.preventDefault();
      handleDateSelect(addDays(date, offset), offset > 0 ? 'forward' : 'backward');
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      handleDateSelect(new Date(currentYear, currentMonth, 1), 'forward');
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      handleDateSelect(new Date(currentYear, currentMonth + 1, 0), 'backward');
    }
  };

  return (
    <div
      className={`calendar-widget rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-background)/0.7)] p-3 ${className}`}
    >
      <h3 className="mb-3 text-lg font-medium text-foreground">Datum auswählen</h3>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>

          <span className="font-medium text-foreground">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8"
            aria-label="Nächster Monat"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div role="grid" aria-label="Kalender" className="grid grid-cols-7 gap-0 p-2">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              role="columnheader"
              className="flex items-center justify-center p-2 text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {calendarDates.map((calendarDate) => {
            const id = toDateId(calendarDate.date);
            return (
              <button
                key={id}
                type="button"
                role="gridcell"
                aria-selected={calendarDate.isSelected}
                aria-current={calendarDate.isToday ? 'date' : undefined}
                aria-disabled={calendarDate.isWeekend}
                disabled={calendarDate.isWeekend}
                onClick={() => handleDateSelect(calendarDate.date)}
                onKeyDown={(event) => handleDayKeyDown(event, calendarDate.date)}
                className={[
                  'm-0.5 flex items-center justify-center rounded-md p-2 text-sm transition-colors duration-150',
                  calendarDate.isOtherMonth ? 'text-muted-foreground opacity-60' : 'text-foreground',
                  calendarDate.isWeekend
                    ? 'cursor-not-allowed bg-muted/30 text-muted-foreground opacity-45'
                    : calendarDate.isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent',
                  calendarDate.isToday && !calendarDate.isSelected ? 'border border-primary' : '',
                ].join(' ')}
              >
                {calendarDate.date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
