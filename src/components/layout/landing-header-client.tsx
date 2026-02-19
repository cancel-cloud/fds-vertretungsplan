'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button, buttonVariants } from '@/components/ui/button';
import { HeaderAuthActions } from '@/components/layout/header-auth-actions';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { captureClientEvent } from '@/lib/analytics/posthog-client';
import { cn } from '@/lib/utils';

interface LandingHeaderClientProps {
  hasSession: boolean;
  userRole: 'USER' | 'ADMIN';
}

export function LandingHeaderClient({ hasSession, userRole }: LandingHeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuId = 'landing-mobile-menu';

  const toggleMobileMenu = () => {
    const next = !isMobileMenuOpen;
    setIsMobileMenuOpen(next);
    captureClientEvent(ANALYTICS_EVENTS.MOBILE_MENU_TOGGLED, { open: next, header: 'landing' });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    captureClientEvent(ANALYTICS_EVENTS.MOBILE_MENU_TOGGLED, {
      open: false,
      source: 'dismiss',
      header: 'landing',
    });
  };

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link
            href="/"
            className="motion-link-underline motion-safe-base rounded-sm px-2 py-1 text-xl font-semibold text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-secondary)/0.12)] hover:text-[rgb(var(--color-primary))] focus-visible:outline-2 focus-visible:outline-[rgb(var(--color-primary))] focus-visible:outline-offset-2 -mx-2 -my-1"
          >
            FDS Vertretungsplan
          </Link>

          <div className="flex items-center justify-end gap-2">
            <div className="hidden md:flex md:flex-wrap md:items-center md:justify-end md:gap-2">
              {hasSession ? <HeaderAuthActions role={userRole} /> : null}
              {!hasSession ? (
                <Link href="/stundenplan/login?next=/" className={buttonVariants({ size: 'sm' })}>
                  Login
                </Link>
              ) : null}
            </div>

            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-secondary)/0.12)] md:hidden"
              aria-controls={mobileMenuId}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
            >
              <span className="relative inline-flex h-6 w-6 items-center justify-center">
                <Menu
                  className={cn(
                    'absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 transition-all duration-200',
                    isMobileMenuOpen ? 'scale-75 opacity-0 -rotate-90' : 'scale-100 opacity-100 rotate-0'
                  )}
                />
                <X
                  className={cn(
                    'absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 transition-all duration-200',
                    isMobileMenuOpen ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-90'
                  )}
                />
              </span>
            </Button>
          </div>
        </div>
      </header>

      <MobileMenu id={mobileMenuId} isOpen={isMobileMenuOpen} onClose={closeMobileMenu}>
        {hasSession ? (
          <div className="flex flex-col gap-2 md:hidden">
            <Link
              href="/stundenplan/stundenplan"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-start')}
              onClick={closeMobileMenu}
            >
              Stundenplan bearbeiten
            </Link>
            <Link
              href="/stundenplan/settings"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-start')}
              onClick={closeMobileMenu}
            >
              Einstellungen
            </Link>
            {userRole === 'ADMIN' ? (
              <Link
                href="/stundenplan/admin"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-start')}
                onClick={closeMobileMenu}
              >
                Admin
              </Link>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                closeMobileMenu();
                void signOut({ callbackUrl: '/' });
              }}
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="md:hidden">
            <Link
              href="/stundenplan/login?next=/"
              className={cn(buttonVariants({ size: 'sm' }), 'w-full justify-center')}
              onClick={closeMobileMenu}
            >
              Login
            </Link>
          </div>
        )}
      </MobileMenu>
    </>
  );
}
