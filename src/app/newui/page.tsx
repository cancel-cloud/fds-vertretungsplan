import { Suspense } from 'react';
import { LandingHeader } from '@/components/layout/landing-header';
import { NewUiClient } from '@/components/newui/new-ui-client';

export default function NewUiPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-background))]">
      <LandingHeader />
      <Suspense fallback={<div className="p-6">Lade…</div>}>
        <NewUiClient analyticsSource="newui_route" />
      </Suspense>
    </div>
  );
}
