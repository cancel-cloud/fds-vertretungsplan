'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border)/0.2)] shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="md:hidden text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-secondary)/0.12)]"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
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
