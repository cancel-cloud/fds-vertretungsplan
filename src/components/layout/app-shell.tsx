'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { captureClientEvent } from '@/lib/analytics/posthog-client';

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  mobileMenuContent?: React.ReactNode;
  mainClassName?: string;
  contentClassName?: string;
}

export function AppShell({
  children,
  sidebar,
  mobileMenuContent,
  mainClassName = 'p-6',
  contentClassName = 'mx-auto flex max-w-7xl',
}: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuId = 'app-shell-mobile-menu';

  const toggleMobileMenu = () => {
    const next = !isMobileMenuOpen;
    setIsMobileMenuOpen(next);
    captureClientEvent(ANALYTICS_EVENTS.MOBILE_MENU_TOGGLED, { open: next });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    captureClientEvent(ANALYTICS_EVENTS.MOBILE_MENU_TOGGLED, { open: false, source: 'dismiss' });
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-background))]">
      <Header onMenuToggle={toggleMobileMenu} isMenuOpen={isMobileMenuOpen} menuId={mobileMenuId} />

      <MobileMenu id={mobileMenuId} isOpen={isMobileMenuOpen} onClose={closeMobileMenu}>
        {mobileMenuContent}
      </MobileMenu>

      <div className={contentClassName}>
        {sidebar ? (
          <aside
            aria-label="Seitenleiste"
            className="hidden min-h-[calc(100vh-64px)] w-80 border-r border-[rgb(var(--color-border)/0.2)] p-6 md:block"
          >
            <div className="sticky top-6 space-y-6">{sidebar}</div>
          </aside>
        ) : null}

        <main id="main-content" className={`flex-1 ${mainClassName}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
