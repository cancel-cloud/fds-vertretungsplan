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
        'fixed inset-0 z-20 flex items-center justify-end bg-white/80 p-4 transition-opacity duration-300 md:hidden',
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
          'h-[70vh] w-full max-w-[360px] overflow-y-auto rounded-2xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] shadow-xl transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Mobile menu header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--color-border)/0.3)]">
          <h3 className="text-lg font-medium text-[rgb(var(--color-text))]">Menü</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-secondary)/0.12)]"
            aria-label="Menü schließen"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile menu content */}
        <div className="p-4 flex flex-col gap-5">
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
