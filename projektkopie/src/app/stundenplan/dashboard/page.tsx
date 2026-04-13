import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/stundenplan/dashboard-client';
import { LandingHeader } from '@/components/layout/landing-header';
import { DASHBOARD_SCOPE_PARAM, parseDashboardScope } from '@/lib/dashboard-scope';
import { isDemoMode } from '@/lib/demo-config';
import { buildPathWithSearchParams } from '@/lib/login-target';
import {
  getOptionalSignedInUser,
  redirectIfBootstrapAdminRegistrationRequired,
  redirectIfAdminSetupRequired,
} from '@/lib/stundenplan-page-guards';

interface DashboardPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const toQueryString = (searchParams: Record<string, string | string[] | undefined>): string => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
      continue;
    }

    if (typeof value === 'string') {
      params.set(key, value);
    }
  }

  return params.toString();
};

export default async function StundenplanDashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const demoMode = isDemoMode();
  const scopeCandidate = Array.isArray(resolvedSearchParams[DASHBOARD_SCOPE_PARAM])
    ? resolvedSearchParams[DASHBOARD_SCOPE_PARAM][0]
    : resolvedSearchParams[DASHBOARD_SCOPE_PARAM];
  const user = await getOptionalSignedInUser();
  const scope = user ? parseDashboardScope(scopeCandidate) : scopeCandidate === 'personal' ? 'personal' : 'all';

  if (!user && !demoMode) {
    await redirectIfBootstrapAdminRegistrationRequired();
  }

  if (scope === 'personal' && !user) {
    const queryString = toQueryString(resolvedSearchParams);
    redirect(buildPathWithSearchParams('/', queryString, { scopeOverride: 'all' }));
  }

  if (scope === 'personal' && user) {
    await redirectIfAdminSetupRequired(user);
  }

  return (
    <div className="bg-[rgb(var(--color-background))]">
      <LandingHeader />
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <DashboardClient initialScope={scope} isAuthenticated={Boolean(user)} isDemoMode={demoMode} />
      </main>
    </div>
  );
}
