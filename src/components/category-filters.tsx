'use client';

import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryFiltersProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onClearAll: () => void;
  onResetAllFilters?: () => void;
  showResetAll?: boolean;
  className?: string;
}

const getCategoryColor = (type: string): string => {
  switch (type) {
    case 'Entfall':
      return 'bg-[rgb(var(--color-entfall))] hover:bg-[rgb(var(--color-entfall)/0.86)]';
    case 'Raumänderung':
      return 'bg-[rgb(var(--color-raumaenderung))] hover:bg-[rgb(var(--color-raumaenderung)/0.86)]';
    case 'Vertretung':
      return 'bg-[rgb(var(--color-vertretung))] hover:bg-[rgb(var(--color-vertretung)/0.86)]';
    case 'Sondereinsatz':
      return 'bg-[rgb(var(--color-sondereinsatz))] hover:bg-[rgb(var(--color-sondereinsatz)/0.86)]';
    case 'EVA':
      return 'bg-[rgb(var(--color-eva))] hover:bg-[rgb(var(--color-eva)/0.86)]';
    case 'Klausur':
      return 'bg-[rgb(var(--color-klausur))] hover:bg-[rgb(var(--color-klausur)/0.86)]';
    case 'Freisetzung':
      return 'bg-[rgb(var(--color-freisetzung))] hover:bg-[rgb(var(--color-freisetzung)/0.86)]';
    case 'Verlegung':
      return 'bg-[rgb(var(--color-verlegung))] hover:bg-[rgb(var(--color-verlegung)/0.86)]';
    default:
      return 'bg-[rgb(var(--color-sonstiges))] hover:bg-[rgb(var(--color-sonstiges)/0.86)]';
  }
};

const getCategoryDotColor = (type: string): string => {
  switch (type) {
    case 'Entfall':
      return 'bg-[rgb(var(--color-entfall))]';
    case 'Raumänderung':
      return 'bg-[rgb(var(--color-raumaenderung))]';
    case 'Vertretung':
      return 'bg-[rgb(var(--color-vertretung))]';
    case 'Sondereinsatz':
      return 'bg-[rgb(var(--color-sondereinsatz))]';
    case 'EVA':
      return 'bg-[rgb(var(--color-eva))]';
    case 'Klausur':
      return 'bg-[rgb(var(--color-klausur))]';
    case 'Freisetzung':
      return 'bg-[rgb(var(--color-freisetzung))]';
    case 'Verlegung':
      return 'bg-[rgb(var(--color-verlegung))]';
    default:
      return 'bg-[rgb(var(--color-sonstiges))]';
  }
};

const getSelectedTextColor = (type: string): string => {
  if (type === 'Verlegung' || type === 'EVA' || type === 'Klausur') {
    return 'text-[rgb(var(--color-text))]';
  }

  return 'text-white';
};

export function CategoryFilters({
  categories,
  selectedCategories,
  onCategoryToggle,
  onClearAll,
  onResetAllFilters,
  showResetAll = false,
  className = '',
}: CategoryFiltersProps) {
  const hasActiveFilters = selectedCategories.length > 0;
  const canResetAll = showResetAll && typeof onResetAllFilters === 'function';

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[rgb(var(--color-text))]">Nach Typ filtern</h4>
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-8 px-2 text-xs text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text))]"
          >
            Alle entfernen
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);

          return (
            <Button
              key={category}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryToggle(category)}
              className={cn(
                'motion-chip relative h-8 overflow-hidden border px-3 text-xs font-medium',
                isSelected
                  ? `${getCategoryColor(category)} ${getSelectedTextColor(category)} border-transparent shadow-sm`
                  : 'border-[rgb(var(--color-border)/0.55)] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface)/0.8)]'
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'motion-chip-pill absolute inset-x-2 bottom-1 h-[2px] origin-left rounded-full bg-current',
                  isSelected ? 'scale-x-100 opacity-90' : 'scale-x-0 opacity-0'
                )}
              />
              <span className="relative z-10 flex items-center gap-2">
                {!isSelected ? (
                  <span className={`h-2 w-2 rounded-full ${getCategoryDotColor(category)}`} />
                ) : null}
                <span>{category}</span>
              </span>
            </Button>
          );
        })}

        {canResetAll ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetAllFilters}
            className="motion-chip h-8 border-[rgb(var(--color-border)/0.55)] bg-[rgb(var(--color-surface))] px-3 text-xs text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text))]"
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Alles zurücksetzen
          </Button>
        ) : null}
      </div>

      {hasActiveFilters ? (
        <div className="motion-fade text-xs text-[rgb(var(--color-text-secondary))]">
          {selectedCategories.length} Filter aktiv
        </div>
      ) : null}
    </div>
  );
}
