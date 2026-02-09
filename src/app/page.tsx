'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { MobileThemePanel } from '@/components/layout/mobile-theme-panel';
import { CalendarWidget } from '@/components/calendar-widget';
import { SubstitutionList } from '@/components/substitution-list';
import { WelcomeOverlay } from '@/components/welcome-overlay';
import { useSubstitutions } from '@/hooks/use-substitutions';
import { FilterState, SubstitutionType } from '@/types';
import { filterSubstitutions, getUniqueSubstitutionTypes, sortSubstitutions } from '@/lib/data-processing';
import { adjustWeekendToMonday } from '@/lib/date-utils';
import { ANALYTICS_EVENTS, redactSearch } from '@/lib/analytics/events';
import { usePostHogContext } from '@/providers/posthog-provider';

const FlaggedNewUiPage = dynamic(() => import('@/app/newui/page'), {
  ssr: false,
  loading: () => <div className="p-6">Lade Oberfläche…</div>,
});

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-6">Lade…</div>}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const { capture, featureFlagsReady, isFeatureEnabled } = usePostHogContext();

  const useNewUi = featureFlagsReady ? isFeatureEnabled('ui.new_homepage', false) : false;
  const showWelcomeOverlay = isFeatureEnabled('ui.welcome_overlay', false);
  const advancedCalendar = isFeatureEnabled('ui.advanced_calendar', false);

  useEffect(() => {
    capture(ANALYTICS_EVENTS.UI_VARIANT_EXPOSED, {
      variant: useNewUi ? 'newui' : 'legacy',
      source: 'home_flag',
    });
  }, [capture, useNewUi]);

  if (useNewUi) {
    return <FlaggedNewUiPage />;
  }

  return <LegacyHome advancedCalendar={advancedCalendar} showWelcomeOverlay={showWelcomeOverlay} />;
}

function LegacyHome({
  advancedCalendar,
  showWelcomeOverlay,
}: {
  advancedCalendar: boolean;
  showWelcomeOverlay: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { capture } = usePostHogContext();

  const searchParamValue = searchParams.get('search') || '';
  const [selectedDate, setSelectedDate] = useState<Date>(() => adjustWeekendToMonday(new Date()));
  const [filterState, setFilterState] = useState<FilterState>({
    search: searchParamValue,
    categories: [],
  });
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<number | null>(null);

  useEffect(
    () => () => {
      if (searchDebounceTimer) {
        window.clearTimeout(searchDebounceTimer);
      }
    },
    [searchDebounceTimer]
  );

  useEffect(() => {
    setFilterState((prev) => {
      if (prev.search === searchParamValue) {
        return prev;
      }
      return {
        ...prev,
        search: searchParamValue,
      };
    });
  }, [searchParamValue]);

  const { substitutions, isLoading, error, metaResponse, refetch } = useSubstitutions(selectedDate);

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

  const scheduleSearchUrlSync = (value: string) => {
    if (searchDebounceTimer) {
      window.clearTimeout(searchDebounceTimer);
    }

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    setSearchDebounceTimer(timer);
  };

  const handleSearchChange = (value: string) => {
    setFilterState((prev) => ({ ...prev, search: value }));
    scheduleSearchUrlSync(value);

    capture(ANALYTICS_EVENTS.SEARCH_UPDATED, {
      ...redactSearch(value),
      location: 'legacy',
    });
  };

  const handleCategoryToggle = (category: string) => {
    const categoryAsType = category as SubstitutionType;
    setFilterState((prev) => {
      const next = prev.categories.includes(categoryAsType)
        ? prev.categories.filter((entry) => entry !== categoryAsType)
        : [...prev.categories, categoryAsType];

      capture(ANALYTICS_EVENTS.CATEGORY_TOGGLED, {
        category: categoryAsType,
        selected_count: next.length,
        location: 'legacy',
      });

      return {
        ...prev,
        categories: next,
      };
    });
  };

  const handleClearCategories = () => {
    setFilterState((prev) => ({ ...prev, categories: [] }));
    capture(ANALYTICS_EVENTS.FILTERS_CLEARED, { scope: 'categories', location: 'legacy' });
  };

  const handleClearAllFilters = () => {
    setFilterState({ search: '', categories: [] });
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    capture(ANALYTICS_EVENTS.FILTERS_CLEARED, { scope: 'all', location: 'legacy' });
  };

  const setDateAndTrack = (date: Date, source: string) => {
    setSelectedDate(date);
    capture(ANALYTICS_EVENTS.DATE_SELECTED, {
      source,
      day_of_week: date.getDay(),
      timestamp: date.getTime(),
    });
  };

  return (
    <>
      <AppShell
        sidebar={
          <CalendarWidget
            selectedDate={selectedDate}
            onDateSelect={(date) => setDateAndTrack(date, 'sidebar')}
            enableAdvancedFeatures={advancedCalendar}
          />
        }
        mobileMenuContent={
          <div className="flex flex-col gap-6 p-2">
            <CalendarWidget
              selectedDate={selectedDate}
              onDateSelect={(date) => setDateAndTrack(date, 'mobile_menu')}
              className="w-full"
              enableAdvancedFeatures={advancedCalendar}
            />
            <MobileThemePanel />
          </div>
        }
      >
        <SubstitutionList
          substitutions={substitutions}
          filteredSubstitutions={filteredSubstitutions}
          availableCategories={availableCategories}
          stats={stats}
          filterState={filterState}
          onSearchChange={handleSearchChange}
          onCategoryToggle={handleCategoryToggle}
          onClearCategories={handleClearCategories}
          onClearAllFilters={handleClearAllFilters}
          isLoading={isLoading}
          error={error}
          onRetry={() => {
            capture(ANALYTICS_EVENTS.RETRY_CLICKED, { location: 'legacy' });
            refetch();
          }}
          selectedDate={selectedDate}
          metaResponse={metaResponse}
        />
      </AppShell>

      <WelcomeOverlay enabled={showWelcomeOverlay} />
    </>
  );
}
