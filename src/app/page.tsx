import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { LandingHeader } from '@/components/layout/landing-header';
import { NewUiClient } from '@/components/newui/new-ui-client';
import { DashboardClient } from '@/components/stundenplan/dashboard-client';
import { getCurrentUser } from '@/lib/auth/guards';
import { DASHBOARD_SCOPE_PARAM, parseDashboardScope } from '@/lib/dashboard-scope';
import { isDemoMode } from '@/lib/demo-config';
import { prisma } from '@/lib/prisma';

interface HomePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const user = await getCurrentUser();
  const demoMode = isDemoMode();

  if (!user) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-background))]">
        <LandingHeader />
        <Suspense fallback={<div className="p-6">Lade…</div>}>
          <NewUiClient analyticsSource="home_default" showLoginPromo isDemoMode={demoMode} />
        </Suspense>
      </div>
    );
  }

  if (user.role === 'ADMIN') {
    const teacherCount = await prisma.teacherDirectory.count();
    if (teacherCount === 0) {
      redirect('/stundenplan/admin-setup');
    }
  }

  if (!user.onboardingCompletedAt && !user.onboardingSkippedAt) {
    redirect('/stundenplan/onboarding');
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const scopeCandidate = Array.isArray(resolvedSearchParams[DASHBOARD_SCOPE_PARAM])
    ? resolvedSearchParams[DASHBOARD_SCOPE_PARAM][0]
    : resolvedSearchParams[DASHBOARD_SCOPE_PARAM];
  const scope = parseDashboardScope(scopeCandidate);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-background))]">
      <LandingHeader />
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <DashboardClient initialScope={scope} isAuthenticated isDemoMode={demoMode} />
      </main>
    </div>
  );
}
