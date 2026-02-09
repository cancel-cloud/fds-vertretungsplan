import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { MobileThemePanel } from '@/components/layout/mobile-theme-panel';
import { ImpressumContent } from '@/components/legal/impressum-content';

export const metadata: Metadata = {
  title: 'Impressum | FDS Vertretungsplan',
  description: 'Impressum von Lukas Dienst - Angaben gemäß § 5 TMG',
  keywords: 'Impressum, Lukas Dienst, DevBrew, FDS, Vertretungsplan',
};

export default function ImpressumPage() {
  return (
    <AppShell mobileMenuContent={<MobileThemePanel />} sidebar={<div className="h-80" aria-hidden="true" />}>
      <ImpressumContent />
    </AppShell>
  );
}
