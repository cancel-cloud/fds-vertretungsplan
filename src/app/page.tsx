'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { CalendarWidget } from '@/components/calendar-widget';
import { ThemeToggle } from '@/components/theme-toggle';
import { SubstitutionList } from '@/components/substitution-list';
import { WelcomeOverlay } from '@/components/welcome-overlay';
import { useSubstitutions } from '@/hooks/use-substitutions';
import { FilterState } from '@/types';
import { sortSubstitutions, filterSubstitutions, getUniqueSubstitutionTypes } from '@/lib/data-processing';

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    categories: []
  });
  
  // Fetch substitution data
  const { substitutions, isLoading, error, metaResponse, refetch } = useSubstitutions(selectedDate);

  // Process and filter substitutions
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
        hasActiveFilters: filterState.search.trim() !== '' || filterState.categories.length > 0
      }
    };
  }, [substitutions, filterState]);

  const handleSearchChange = (value: string) => {
    setFilterState(prev => ({ ...prev, search: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setFilterState(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleClearCategories = () => {
    setFilterState(prev => ({ ...prev, categories: [] }));
  };

  const handleClearAllFilters = () => {
    setFilterState({ search: '', categories: [] });
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const mobileMenuContent = (
    <div className="flex flex-col gap-6 p-6">
      {/* Calendar for mobile */}
      <div>
        <CalendarWidget
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          className="w-full"
        />
      </div>

      {/* Theme toggle for mobile */}
      <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--color-border)/0.2)]">
        <span className="text-[rgb(var(--color-text-secondary))]">Theme</span>
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[rgb(var(--color-background))]">
      <WelcomeOverlay />
      
      <Header onMenuToggle={handleMobileMenuToggle} />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      >
        {mobileMenuContent}
      </MobileMenu>

      <div className="flex max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-80 p-6 border-r border-[rgb(var(--color-border)/0.2)] min-h-[calc(100vh-64px)]">
          <div className="sticky top-6 space-y-6">
            {/* Calendar Widget */}
            <div>
              <CalendarWidget
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
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
            onRetry={refetch}
            selectedDate={selectedDate}
            metaResponse={metaResponse}
          />
        </main>
      </div>
    </div>
  );
}
