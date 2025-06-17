'use client';

import { Button } from '@/components/ui/button';

interface CategoryFiltersProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onClearAll: () => void;
  className?: string;
}

// Category color mapping for filter buttons
const getCategoryColor = (type: string): string => {
  switch (type) {
    case 'Entfall':
      return 'bg-[rgb(var(--color-entfall))] hover:bg-[rgb(var(--color-entfall)/0.8)]';
    case 'Raumänderung':
      return 'bg-[rgb(var(--color-raumaenderung))] hover:bg-[rgb(var(--color-raumaenderung)/0.8)]';
    case 'Vertretung':
      return 'bg-[rgb(var(--color-vertretung))] hover:bg-[rgb(var(--color-vertretung)/0.8)]';
    case 'Sondereinsatz':
      return 'bg-[rgb(var(--color-sondereinsatz))] hover:bg-[rgb(var(--color-sondereinsatz)/0.8)]';
    case 'EVA':
      return 'bg-[rgb(var(--color-eva))] hover:bg-[rgb(var(--color-eva)/0.8)]';
    case 'Klausur':
      return 'bg-[rgb(var(--color-klausur))] hover:bg-[rgb(var(--color-klausur)/0.8)]';
    case 'Freisetzung':
      return 'bg-[rgb(var(--color-freisetzung))] hover:bg-[rgb(var(--color-freisetzung)/0.8)]';
    case 'Verlegung':
      return 'bg-[rgb(var(--color-verlegung))] hover:bg-[rgb(var(--color-verlegung)/0.8)]';
    default:
      return 'bg-[rgb(var(--color-sonstiges))] hover:bg-[rgb(var(--color-sonstiges)/0.8)]';
  }
};

// Get the color indicator (dot) for inactive state
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

export function CategoryFilters({
  categories,
  selectedCategories,
  onCategoryToggle,
  onClearAll,
  className = ""
}: CategoryFiltersProps) {
  const hasActiveFilters = selectedCategories.length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[rgb(var(--color-text))]">
          Nach Typ filtern
        </h4>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-8 px-2 text-xs text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text))]"
          >
            Alle entfernen
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const colorClass = getCategoryColor(category);
          const dotColorClass = getCategoryDotColor(category);

          return (
            <Button
              key={category}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryToggle(category)}
              className={`
                h-8 px-3 text-xs font-medium transition-all duration-200 
                ${isSelected 
                  ? `${colorClass} text--co border-transparent` 
                  : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface))]'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {!isSelected && (
                  <div className={`w-2 h-2 rounded-full ${dotColorClass}`} />
                )}
                <span>{category}</span>
              </div>
            </Button>
          );
        })}
      </div>

      {hasActiveFilters && (
        <div className="text-xs text-[rgb(var(--color-text-secondary))]">
          {selectedCategories.length} Filter aktiv
        </div>
      )}
    </div>
  );
} 