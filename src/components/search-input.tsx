'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Klasse, Fach, Raum oder Lehrer suchen...",
  className = "" 
}: SearchInputProps) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="group/search relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-text-secondary))] transition-colors duration-200 group-focus-within/search:text-[rgb(var(--color-primary))]"
          aria-hidden="true"
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          feedback="subtle"
          className="pl-10 pr-10 bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] focus:border-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-focus-ring))]"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className={`absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text))] transition-all duration-200 ${
            value ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
          }`}
          aria-label="Suche zurücksetzen"
          aria-hidden={!value}
          tabIndex={value ? 0 : -1}
          disabled={!value}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
} 
