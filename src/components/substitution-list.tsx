'use client';

import { ProcessedSubstitution, FilterState, SubstitutionApiMetaResponse } from '@/types';
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
  metaResponse?: SubstitutionApiMetaResponse | null;
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
  metaResponse = null,
  className = ""
}: SubstitutionListProps) {
  const listMotionKey = `${selectedDate.toISOString()}-${filterState.search}-${filterState.categories.join(',')}-${filteredSubstitutions.length}`;
  const loadingSkeleton = Array.from({ length: 3 });

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
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center gap-3 text-[rgb(var(--color-text-secondary))]">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Vertretungen werden geladen...</span>
          </div>
          {loadingSkeleton.map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="skeleton-shimmer relative overflow-hidden rounded-xl border border-[rgb(var(--color-border)/0.25)] bg-[rgb(var(--color-surface))] p-4"
            >
              <div className="space-y-3">
                <div className="h-5 w-40 rounded bg-[rgb(var(--color-border)/0.18)]" />
                <div className="h-4 w-64 rounded bg-[rgb(var(--color-border)/0.12)]" />
                <div className="h-4 w-52 rounded bg-[rgb(var(--color-border)/0.12)]" />
              </div>
            </div>
          ))}
        </div>
      ) : metaResponse ? (
        <div className="flex items-center justify-center py-12">
          <div className="motion-empty-soft-pulse text-center space-y-4 max-w-lg">
            <div className="flex justify-center">
              <Calendar className="h-12 w-12 text-[rgb(var(--color-text-secondary))]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">
                Kein Vertretungsplan verfügbar
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))]">
                Kein Vertretungsplan verfügbar. {metaResponse.message}
              </p>
            </div>
          </div>
        </div>
      ) : filteredSubstitutions.length > 0 ? (
        <div key={listMotionKey} className="grid gap-4">
          {filteredSubstitutions.map((substitution, index) => (
            <div
              key={`${substitution.group}-${substitution.hours}-${substitution.subject}-${index}`}
              className="motion-enter"
              style={{ animationDelay: `${Math.min(index * 35, 210)}ms` }}
            >
              <SubstitutionCard substitution={substitution} />
            </div>
          ))}
        </div>
      ) : substitutions.length > 0 ? (
        // No results after filtering
        <div className="flex items-center justify-center py-12">
          <div className="motion-empty-soft-pulse text-center space-y-4">
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
          <div className="motion-empty-soft-pulse text-center space-y-4">
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
