'use client';

import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  menuId: string;
}

export function Header({ onMenuToggle, isMenuOpen, menuId }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border)/0.2)] shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="md:hidden text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-secondary)/0.12)]"
          aria-controls={menuId}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
        >
          <span className="relative inline-flex h-6 w-6 items-center justify-center">
            <Menu
              className={cn(
                'absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 transition-all duration-200',
                isMenuOpen ? 'scale-75 opacity-0 -rotate-90' : 'scale-100 opacity-100 rotate-0'
              )}
            />
            <X
              className={cn(
                'absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 transition-all duration-200',
                isMenuOpen ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-90'
              )}
            />
          </span>
        </Button>

        {/* App title */}
        <Link 
          href="/"
          className="motion-link-underline motion-safe-base text-xl font-semibold text-[rgb(var(--color-text))] hover:text-[rgb(var(--color-primary))] rounded-sm px-2 py-1 -mx-2 -my-1 hover:bg-[rgb(var(--color-secondary)/0.12)] focus-visible:outline-[rgb(var(--color-primary))] focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Vertretungsplan
        </Link>

        <div className="flex items-center gap-4">
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/impressum"
              className="motion-link-underline motion-safe-base text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] rounded-sm px-2 py-1 -mx-2 -my-1 hover:bg-[rgb(var(--color-secondary)/0.12)] focus-visible:outline-[rgb(var(--color-primary))] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="motion-link-underline motion-safe-base text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] rounded-sm px-2 py-1 -mx-2 -my-1 hover:bg-[rgb(var(--color-secondary)/0.12)] focus-visible:outline-[rgb(var(--color-primary))] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Datenschutz
            </Link>
          </nav>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
} 
