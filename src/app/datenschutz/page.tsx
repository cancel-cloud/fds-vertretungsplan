import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { DatenschutzContent } from '@/components/legal/datenschutz-content';

export const metadata: Metadata = {
  title: 'Datenschutz | FDS Vertretungsplan',
  description:
    'Datenschutzerklärung - Informationen zum Datenschutz und zur Verarbeitung Ihrer Daten beim FDS Vertretungsplan',
  keywords: 'Datenschutz, DSGVO, Cookies, Server-Log Files, Rechte, Vertretungsplan',
  robots: {
    index: false,
    follow: true,
  },
};

export default function DatenschutzPage() {
  return (
    <AppShell sidebar={<div className="h-80" aria-hidden="true" />}>
      <DatenschutzContent />
    </AppShell>
  );
}
