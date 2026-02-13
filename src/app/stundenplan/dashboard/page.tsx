import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/guards';
import { DashboardClient } from '@/components/stundenplan/dashboard-client';
import { LandingHeader } from '@/components/layout/landing-header';
import { prisma } from '@/lib/prisma';
import { DASHBOARD_SCOPE_PARAM, parseDashboardScope } from '@/lib/dashboard-scope';

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
  const scopeCandidate = Array.isArray(resolvedSearchParams[DASHBOARD_SCOPE_PARAM])
    ? resolvedSearchParams[DASHBOARD_SCOPE_PARAM][0]
    : resolvedSearchParams[DASHBOARD_SCOPE_PARAM];
  const scope = parseDashboardScope(scopeCandidate);
  const user = await getCurrentUser();

  if (scope === 'personal' && !user) {
    const queryString = toQueryString(resolvedSearchParams);
    const nextPath = `/stundenplan/dashboard${queryString ? `?${queryString}` : ''}`;
    redirect(`/stundenplan/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (scope === 'personal' && user?.role === 'ADMIN') {
    const teacherCount = await prisma.teacherDirectory.count();
    if (teacherCount === 0) {
      redirect('/stundenplan/admin-setup');
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-background))]">
      <LandingHeader />
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <DashboardClient initialScope={scope} isAuthenticated={Boolean(user)} />
      </main>
    </div>
  );
}
