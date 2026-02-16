import { Suspense } from 'react';
import { LandingHeader } from '@/components/layout/landing-header';
import { NewUiClient } from '@/components/newui/new-ui-client';
import { isDemoMode } from '@/lib/demo-config';

export default function NewUiPage() {
  const demoMode = isDemoMode();

  return (
    <div className="min-h-screen bg-[rgb(var(--color-background))]">
      <LandingHeader />
      <Suspense fallback={<div className="p-6">Lade…</div>}>
        <NewUiClient analyticsSource="newui_route" isDemoMode={demoMode} />
      </Suspense>
    </div>
  );
}
