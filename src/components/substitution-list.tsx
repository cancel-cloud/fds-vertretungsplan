'use client';

import { ProcessedSubstitution, FilterState } from '@/types';
import { SubstitutionCard } from './substitution-card';
import { SearchInput } from './search-input';
import { CategoryFilters } from './category-filters';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubstitutionListProps {
  substitutions: ProcessedSubstitution[];
  filteredSubstitutions: ProcessedSubstitution[];
  availableCategories: string[];
  stats: {
    total: number;
    filtered: number;
    hasActiveFilters: boolean;
  };
  filterState: FilterState;
  onSearchChange: (value: string) => void;
  onCategoryToggle: (category: string) => void;
  onClearCategories: () => void;
  onClearAllFilters: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  selectedDate: Date;
  className?: string;
}

export function SubstitutionList({
  substitutions,
  filteredSubstitutions,
  availableCategories,
  stats,
  filterState,
  onSearchChange,
  onCategoryToggle,
  onClearCategories,
  onClearAllFilters,
  isLoading = false,
  error = null,
  onRetry,
  selectedDate,
  className = ""
}: SubstitutionListProps) {

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-[rgb(var(--color-error))]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">
              Fehler beim Laden
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] max-w-md">
              {error}
            </p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Erneut versuchen
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchInput
          value={filterState.search}
          onChange={onSearchChange}
          className="w-full"
        />
        
        {availableCategories.length > 0 && (
          <CategoryFilters
            categories={availableCategories}
            selectedCategories={filterState.categories}
            onCategoryToggle={onCategoryToggle}
            onClearAll={onClearCategories}
          />
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
            Vertretungen für {selectedDate.toLocaleDateString('de-DE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
            <span>
              {stats.hasActiveFilters 
                ? `${stats.filtered} von ${stats.total} Vertretungen`
                : `${stats.total} Vertretungen`
              }
            </span>
            {stats.hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAllFilters}
                className="h-6 px-2 text-xs hover:text-[rgb(var(--color-primary))]"
              >
                Filter zurücksetzen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Loading or Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-[rgb(var(--color-text-secondary))]">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Vertretungen werden geladen...</span>
          </div>
        </div>
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
        // No results after filtering
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Calendar className="h-12 w-12 text-[rgb(var(--color-text-secondary))]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">
                Keine passenden Vertretungen
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))] max-w-md">
                Mit den aktuellen Filtern wurden keine Vertretungen gefunden. 
                Versuchen Sie andere Suchbegriffe oder entfernen Sie Filter.
              </p>
            </div>
            <Button onClick={onClearAllFilters} variant="outline">
              Alle Filter entfernen
            </Button>
          </div>
        </div>
      ) : (
        // No substitutions at all for the selected date
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Calendar className="h-12 w-12 text-[rgb(var(--color-text-secondary))]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">
                Keine Vertretungen
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))]">
                Für diesen Tag sind keine Vertretungen eingetragen.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 