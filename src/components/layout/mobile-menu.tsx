'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export function MobileMenu({ isOpen, onClose, children }: MobileMenuProps) {
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
      className={`mobile-menu-overlay fixed inset-0 bg-black/50 z-20 flex justify-start ${
        isOpen ? 'active' : ''
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="mobile-menu bg-[rgb(var(--color-surface))] w-[85%] max-w-[350px] h-full overflow-y-auto">
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