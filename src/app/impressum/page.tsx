import { ImpressumClient } from './impressum-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum | FDS Vertretungsplan',
  description: 'Impressum von Lukas Dienst - Angaben gemäß § 5 TMG',
  keywords: 'Impressum, Lukas Dienst, DevBrew, FDS, Vertretungsplan',
};

export default function ImpressumPage() {
  return <ImpressumClient />;
} 