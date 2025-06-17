'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarDate {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  isOtherMonth: boolean;
}

interface CalendarWidgetProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
}

export function CalendarWidget({ selectedDate, onDateSelect, className = '' }: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  // German month names
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  // German day names (starting with Monday)
  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const today = new Date();

  const generateCalendarDates = (): CalendarDate[] => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startingDay = firstDayOfMonth.getDay() || 7; // Convert Sunday (0) to 7 for European calendar
    const totalDays = lastDayOfMonth.getDate();

    const dates: CalendarDate[] = [];

    // Days from previous month
    const prevMonthDays = startingDay - 1;
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
    for (let i = prevMonthDays; i > 0; i--) {
      const day = prevMonthLastDay - i + 1;
      const date = new Date(currentYear, currentMonth - 1, day);
      dates.push({
        date,
        isToday: false,
        isSelected: false,
        isOtherMonth: true
      });
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();

      dates.push({
        date,
        isToday,
        isSelected,
        isOtherMonth: false
      });
    }

    // Calculate days needed from next month
    const totalCells = 42; // 6 rows of 7 days
    const remainingCells = totalCells - dates.length;

    // Days from next month
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      dates.push({
        date,
        isToday: false,
        isSelected: false,
        isOtherMonth: true
      });
    }

    return dates;
  };

  const handleDateClick = (calendarDate: CalendarDate) => {
    if (calendarDate.isOtherMonth) {
      // Navigate to the other month first
      const newMonth = calendarDate.date.getMonth();
      const newYear = calendarDate.date.getFullYear();
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
      
      // Then select the date after a small delay to let the month change
      setTimeout(() => {
        onDateSelect(calendarDate.date);
      }, 50);
    } else {
      onDateSelect(calendarDate.date);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const calendarDates = generateCalendarDates();

  return (
    <div className={`calendar-widget ${className}`}>
      <h3 className="text-lg font-medium text-[rgb(var(--color-text))] mb-3">
        Datum auswählen
      </h3>
      
      <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border)/0.2)] rounded-lg overflow-hidden">
        {/* Calendar header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[rgb(var(--color-border)/0.2)]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-secondary)/0.12)] h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="font-medium text-[rgb(var(--color-text))]">
            {monthNames[currentMonth]} {currentYear}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('next')}
            className="text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-secondary)/0.12)] h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0 p-2">
          {/* Day headers */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="flex items-center justify-center p-2 text-xs font-medium text-[rgb(var(--color-text-secondary))]"
            >
              {day}
            </div>
          ))}

          {/* Calendar dates */}
          {calendarDates.map((calendarDate, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(calendarDate)}
              className={`
                flex items-center justify-center p-2 text-sm rounded-md m-0.5 transition-colors duration-150
                ${calendarDate.isOtherMonth 
                  ? 'text-[rgb(var(--color-text-secondary))] opacity-50' 
                  : 'text-[rgb(var(--color-text))]'
                }
                ${calendarDate.isSelected
                  ? 'bg-[rgb(var(--color-primary))] text-white'
                  : 'hover:bg-[rgb(var(--color-secondary)/0.12)]'
                }
                ${calendarDate.isToday && !calendarDate.isSelected
                  ? 'border border-[rgb(var(--color-primary))]'
                  : ''
                }
              `}
            >
              {calendarDate.date.getDate()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 