import { DatenschutzClient } from './datenschutz-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutz | FDS Vertretungsplan',
  description: 'Datenschutzerklärung - Informationen zum Datenschutz und zur Verarbeitung Ihrer Daten beim FDS Vertretungsplan',
  keywords: 'Datenschutz, DSGVO, Cookies, Server-Log Files, Rechte, Vertretungsplan',
};

export default function DatenschutzPage() {
  return <DatenschutzClient />;
} 