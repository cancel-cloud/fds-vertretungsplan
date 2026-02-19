'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
  children?: React.ReactNode;
}

export function MobileMenu({ isOpen, onClose, id, children }: MobileMenuProps) {
  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-30 bg-black/35 transition-opacity duration-300 md:hidden',
        isOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        className={cn(
          'absolute inset-0 h-[100dvh] w-full overflow-y-auto overscroll-contain bg-[rgb(var(--color-surface))] shadow-xl transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Mobile menu header */}
        <div className="flex items-center justify-between border-b border-[rgb(var(--color-border)/0.3)] pb-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))]">
          <h3 className="text-lg font-medium text-[rgb(var(--color-text))]">Menü</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-secondary)/0.12)]"
            aria-label="Menü schließen"
          >
            <X aria-hidden="true" className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile menu content */}
        <div className="flex flex-col gap-5 pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-4">
          {children}

          {/* Legal links */}
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[rgb(var(--color-border)/0.2)]">
            <Link
              href="/impressum"
              className="text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] transition-colors duration-150 py-1"
              onClick={onClose}
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] transition-colors duration-150 py-1"
              onClick={onClose}
            >
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
