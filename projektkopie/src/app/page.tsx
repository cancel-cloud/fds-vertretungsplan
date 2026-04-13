import { Suspense } from 'react';
import { LandingHeader } from '@/components/layout/landing-header';
import { DashboardClient } from '@/components/stundenplan/dashboard-client';
import { DASHBOARD_SCOPE_PARAM, parseDashboardScope } from '@/lib/dashboard-scope';
import { isDemoMode } from '@/lib/demo-config';
import {
  getOptionalSignedInUser,
  redirectIfBootstrapAdminRegistrationRequired,
  redirectIfAdminSetupRequired,
  redirectIfOnboardingIncomplete,
} from '@/lib/stundenplan-page-guards';

interface HomePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const demoMode = isDemoMode();
  const user = await getOptionalSignedInUser();

  if (!user) {
    if (!demoMode) {
      await redirectIfBootstrapAdminRegistrationRequired();
    }

    return (
      <div className="bg-[rgb(var(--color-background))]">
        <LandingHeader />
        <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
          <Suspense fallback={<div className="p-6">Lade…</div>}>
            <DashboardClient initialScope="all" isAuthenticated={false} isDemoMode={demoMode} />
          </Suspense>
        </main>
      </div>
    );
  }

  await redirectIfAdminSetupRequired(user);
  redirectIfOnboardingIncomplete(user);

  const resolvedSearchParams = (await searchParams) ?? {};
  const scopeCandidate = Array.isArray(resolvedSearchParams[DASHBOARD_SCOPE_PARAM])
    ? resolvedSearchParams[DASHBOARD_SCOPE_PARAM][0]
    : resolvedSearchParams[DASHBOARD_SCOPE_PARAM];
  const scope = parseDashboardScope(scopeCandidate);

  return (
    <div className="bg-[rgb(var(--color-background))]">
      <LandingHeader />
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <DashboardClient initialScope={scope} isAuthenticated isDemoMode={demoMode} />
      </main>
    </div>
  );
}
