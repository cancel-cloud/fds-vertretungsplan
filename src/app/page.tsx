import { Suspense } from 'react';
import { LandingHeader } from '@/components/layout/landing-header';
import { NewUiClient } from '@/components/newui/new-ui-client';
import { getServerAuthSession } from '@/lib/auth';
import { isDemoMode } from '@/lib/demo-config';

export default async function HomePage() {
  const session = await getServerAuthSession();
  const demoMode = isDemoMode();

  return (
    <div className="min-h-screen bg-[rgb(var(--color-background))]">
      <LandingHeader />
      <Suspense fallback={<div className="p-6">Lade…</div>}>
        <NewUiClient analyticsSource="home_default" showLoginPromo={!session?.user?.id} isDemoMode={demoMode} />
      </Suspense>
    </div>
  );
}
