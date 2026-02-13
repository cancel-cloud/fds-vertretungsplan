import { Suspense } from 'react';
import { LandingHeader } from '@/components/layout/landing-header';
import { NewUiClient } from '@/components/newui/new-ui-client';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-background))]">
      <LandingHeader />
      <Suspense fallback={<div className="p-6">Lade…</div>}>
        <NewUiClient analyticsSource="home_default" />
      </Suspense>
    </div>
  );
}
