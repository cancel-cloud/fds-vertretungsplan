'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { CalendarWidget } from '@/components/calendar-widget';
import { SearchInput } from '@/components/search-input';
import { CategoryFilters } from '@/components/category-filters';
import { SubstitutionCard } from '@/components/substitution-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSubstitutions } from '@/hooks/use-substitutions';
import { FilterState, ProcessedSubstitution, SubstitutionApiMetaResponse, SubstitutionType } from '@/types';
import {
  filterSubstitutions,
  getUniqueSubstitutionTypes,
  sortSubstitutions,
} from '@/lib/data-processing';
import { ANALYTICS_EVENTS, redactSearch } from '@/lib/analytics/events';
import { usePostHogContext } from '@/providers/posthog-provider';

const startOfLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const adjustWeekendToMonday = (date: Date): Date => {
  const normalizedDate = startOfLocalDay(date);
  const day = normalizedDate.getDay();

  if (day === 6) {
    normalizedDate.setDate(normalizedDate.getDate() + 2);
  } else if (day === 0) {
    normalizedDate.setDate(normalizedDate.getDate() + 1);
  }

  return normalizedDate;
};

const addSchoolDays = (date: Date, offset: number): Date => {
  const result = startOfLocalDay(date);
  const direction = offset >= 0 ? 1 : -1;
  let remaining = Math.abs(offset);

  while (remaining > 0) {
    result.setDate(result.getDate() + direction);
    if (!isWeekend(result)) {
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

interface ResultsPanelProps {
  substitutions: ProcessedSubstitution[];
  filteredSubstitutions: ProcessedSubstitution[];
  stats: {
    total: number;
    filtered: number;
    hasActiveFilters: boolean;
  };
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  metaResponse: SubstitutionApiMetaResponse | null;
  onClearAllFilters: () => void;
}

function ResultsPanel({
  substitutions,
  filteredSubstitutions,
  stats,
  selectedDate,
  isLoading,
  error,
  onRetry,
  metaResponse,
  onClearAllFilters,
}: ResultsPanelProps) {
  if (error) {
    return (
      <Card className="border-[rgb(var(--color-error)/0.25)] bg-[rgb(var(--color-surface))] p-8">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-10 w-10 text-[rgb(var(--color-error))]" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">Fehler beim Laden</h2>
          <p className="mx-auto max-w-lg text-[rgb(var(--color-text-secondary))]">{error}</p>
          <Button onClick={onRetry} variant="outline">
            Erneut versuchen
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[rgb(var(--color-text))]">
              Vertretungen für {formatLongDate(selectedDate)}
            </h2>
            <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">
              {stats.hasActiveFilters
                ? `${stats.filtered} von ${stats.total} Einträgen sichtbar`
                : `${stats.total} Einträge`}
            </p>
          </div>
          {stats.hasActiveFilters ? (
            <Button variant="ghost" onClick={onClearAllFilters}>
              Filter zurücksetzen
            </Button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <Card className="border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-12">
          <div className="flex items-center justify-center gap-3 text-[rgb(var(--color-text-secondary))]">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>Vertretungen werden geladen...</span>
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
      ) : filteredSubstitutions.length > 0 ? (
        <div className="grid gap-4">
          {filteredSubstitutions.map((substitution, index) => (
            <SubstitutionCard
              key={`${substitution.group}-${substitution.hours}-${substitution.subject}-${index}`}
              substitution={substitution}
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
              Mit den aktuellen Filtern wurden keine Vertretungen gefunden.
            </p>
            <div>
              <Button variant="outline" onClick={onClearAllFilters}>
                Alle Filter entfernen
              </Button>
            </div>
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
    </div>
  );
}

export default function NewUiPage() {
  return (
    <Suspense>
      <NewUiPageContent />
    </Suspense>
  );
}

function NewUiPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { capture, isFeatureEnabled } = usePostHogContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => adjustWeekendToMonday(new Date()));
  const [filterState, setFilterState] = useState<FilterState>({
    search: searchParams.get('search') || '',
    categories: [],
  });

  const advancedCalendarEnabled = isFeatureEnabled('ui.advanced_calendar', false);

  const { substitutions, isLoading, error, metaResponse, refetch } = useSubstitutions(selectedDate);

  useEffect(() => {
    capture(ANALYTICS_EVENTS.UI_VARIANT_EXPOSED, {
      variant: 'newui',
      source: 'newui_route',
    });
  }, [capture]);

  const { filteredSubstitutions, availableCategories, stats } = useMemo(() => {
    const sorted = sortSubstitutions(substitutions);
    const categories = getUniqueSubstitutionTypes(substitutions);
    const filtered = filterSubstitutions(sorted, filterState);

    return {
      filteredSubstitutions: filtered,
      availableCategories: categories,
      stats: {
        total: substitutions.length,
        filtered: filtered.length,
        hasActiveFilters: filterState.search.trim() !== '' || filterState.categories.length > 0,
      },
    };
  }, [substitutions, filterState]);

  const handleSearchChange = (value: string) => {
    setFilterState((prev) => ({ ...prev, search: value }));

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    capture(ANALYTICS_EVENTS.SEARCH_UPDATED, {
      ...redactSearch(value),
      location: 'newui',
    });
  };

  const handleCategoryToggle = (category: SubstitutionType) => {
    setFilterState((prev) => {
      const next = prev.categories.includes(category)
        ? prev.categories.filter((entry) => entry !== category)
        : [...prev.categories, category];

      capture(ANALYTICS_EVENTS.CATEGORY_TOGGLED, {
        category,
        selected_count: next.length,
        location: 'newui',
      });

      return {
        ...prev,
        categories: next,
      };
    });
  };

  const handleClearCategories = () => {
    setFilterState((prev) => ({ ...prev, categories: [] }));
    capture(ANALYTICS_EVENTS.FILTERS_CLEARED, { scope: 'categories', location: 'newui' });
  };

  const handleClearAllFilters = () => {
    setFilterState({ search: '', categories: [] });
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    capture(ANALYTICS_EVENTS.FILTERS_CLEARED, { scope: 'all', location: 'newui' });
  };

  const schoolToday = useMemo(() => adjustWeekendToMonday(new Date()), []);
  const schoolYesterday = useMemo(() => addSchoolDays(schoolToday, -1), [schoolToday]);
  const schoolTomorrow = useMemo(() => addSchoolDays(schoolToday, 1), [schoolToday]);
  const quickDateStrip = useMemo(
    () => [schoolYesterday, schoolToday, schoolTomorrow],
    [schoolYesterday, schoolToday, schoolTomorrow]
  );

  const setDateAndTrack = (date: Date, source: string) => {
    setSelectedDate(date);
    capture(ANALYTICS_EVENTS.DATE_SELECTED, {
      source,
      day_of_week: date.getDay(),
      timestamp: date.getTime(),
    });
  };

  const mobileMenuContent = (
    <div className="flex flex-col gap-6 p-6">
      <CalendarWidget
        selectedDate={selectedDate}
        onDateSelect={(date) => setDateAndTrack(date, 'newui_mobile_menu_calendar')}
        className="w-full"
        enableAdvancedFeatures={advancedCalendarEnabled}
      />
      <div className="flex items-center justify-between border-t border-[rgb(var(--color-border)/0.2)] pt-4">
        <span className="text-[rgb(var(--color-text-secondary))]">Theme</span>
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[rgb(var(--color-background))]">
      <Header
        onMenuToggle={() => {
          setIsMobileMenuOpen((current) => {
            const next = !current;
            capture(ANALYTICS_EVENTS.MOBILE_MENU_TOGGLED, { open: next, location: 'newui' });
            return next;
          });
        }}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => {
          setIsMobileMenuOpen(false);
          capture(ANALYTICS_EVENTS.MOBILE_MENU_TOGGLED, { open: false, location: 'newui' });
        }}
      >
        {mobileMenuContent}
      </MobileMenu>

      <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 md:px-6">
        <section className="relative overflow-hidden rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_300px_at_0%_0%,rgb(var(--color-primary)/0.14),transparent_70%),radial-gradient(900px_300px_at_100%_10%,rgb(var(--color-secondary)/0.14),transparent_75%)]" />
          <div className="relative space-y-5 p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--color-text))] md:text-4xl">
                  Vertretungsplan
                </h1>
                <p className="text-sm uppercase tracking-[0.14em] text-[rgb(var(--color-text-secondary))]">
                  Schnellansicht
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setIsMobileCalendarOpen(true)}
                >
                  <CalendarDays className="mr-1 h-4 w-4" aria-hidden="true" />
                  Kalender
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-background)/0.75)] px-4 py-3">
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">Ausgewähltes Datum</p>
              <p className="text-lg font-medium text-[rgb(var(--color-text))]">{formatLongDate(selectedDate)}</p>
            </div>

            <SearchInput value={filterState.search} onChange={handleSearchChange} />

            {stats.hasActiveFilters ? (
              <div className="hidden md:block">
                <Button variant="ghost" size="sm" onClick={handleClearAllFilters}>
                  <RotateCcw className="mr-1 h-4 w-4" aria-hidden="true" />
                  Alles zurücksetzen
                </Button>
              </div>
            ) : null}

            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
              {quickDateStrip.map((date) => {
                const selected = isSameDay(date, selectedDate);
                return (
                  <Button
                    key={date.toISOString()}
                    variant={selected ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 shrink-0 px-3 text-xs touch-manipulation"
                    onClick={() => setDateAndTrack(date, 'newui_quick_strip')}
                    aria-pressed={selected}
                  >
                    {formatChipDate(date)}
                  </Button>
                );
              })}
            </div>

            {availableCategories.length > 0 ? (
              <CategoryFilters
                categories={availableCategories}
                selectedCategories={filterState.categories}
                onCategoryToggle={(category) => handleCategoryToggle(category as SubstitutionType)}
                onClearAll={handleClearCategories}
              />
            ) : null}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <Card className="sticky top-[88px] space-y-4 border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[rgb(var(--color-text-secondary))]">
                Datum wählen
              </h2>
              <CalendarWidget
                selectedDate={selectedDate}
                onDateSelect={(date) => setDateAndTrack(date, 'newui_sidebar_calendar')}
                enableAdvancedFeatures={advancedCalendarEnabled}
              />
            </Card>
          </aside>

          <ResultsPanel
            substitutions={substitutions}
            filteredSubstitutions={filteredSubstitutions}
            stats={stats}
            selectedDate={selectedDate}
            isLoading={isLoading}
            error={error}
            onRetry={() => {
              capture(ANALYTICS_EVENTS.RETRY_CLICKED, { location: 'newui' });
              refetch();
            }}
            metaResponse={metaResponse}
            onClearAllFilters={handleClearAllFilters}
          />
        </div>
      </main>

      <Dialog open={isMobileCalendarOpen} onOpenChange={setIsMobileCalendarOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Datum wählen</DialogTitle>
            <DialogDescription>Schnell zu einem anderen Tag wechseln.</DialogDescription>
          </DialogHeader>
          <CalendarWidget
            selectedDate={selectedDate}
            onDateSelect={(date) => {
              setDateAndTrack(date, 'newui_mobile_dialog_calendar');
              setIsMobileCalendarOpen(false);
            }}
            className="w-full"
            enableAdvancedFeatures={advancedCalendarEnabled}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
