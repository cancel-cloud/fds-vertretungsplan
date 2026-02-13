import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/guards';
import { DashboardClient } from '@/components/stundenplan/dashboard-client';
import { LandingHeader } from '@/components/layout/landing-header';
import { prisma } from '@/lib/prisma';
import { DASHBOARD_SCOPE_PARAM, parseDashboardScope } from '@/lib/dashboard-scope';

interface DashboardV2PageProps {
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

export default async function StundenplanDashboardV2Page({ searchParams }: DashboardV2PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scopeCandidate = Array.isArray(resolvedSearchParams[DASHBOARD_SCOPE_PARAM])
    ? resolvedSearchParams[DASHBOARD_SCOPE_PARAM][0]
    : resolvedSearchParams[DASHBOARD_SCOPE_PARAM];
  const scope = parseDashboardScope(scopeCandidate);
  const user = await getCurrentUser();

  if (scope === 'personal' && !user) {
    const queryString = toQueryString(resolvedSearchParams);
    const nextPath = `/stundenplan/dashboard/v2${queryString ? `?${queryString}` : ''}`;
    redirect(`/stundenplan/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (scope === 'personal' && user?.role === 'ADMIN') {
    const teacherCount = await prisma.teacherDirectory.count();
    if (teacherCount === 0) {
      redirect('/stundenplan/admin-setup');
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[rgb(var(--color-background))]">
      {/* Gradient mesh background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-30 dark:opacity-20"
        aria-hidden="true"
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(var(--color-primary), 0.15) 0%, transparent 70%)',
            'radial-gradient(ellipse 60% 80% at 80% 70%, rgba(var(--color-secondary), 0.12) 0%, transparent 70%)',
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(var(--color-primary), 0.08) 0%, transparent 60%)',
          ].join(', '),
          animation: 'v2-mesh-shift 20s ease-in-out infinite alternate',
        }}
      />

      {/* Floating orbs */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div
          className="absolute h-72 w-72 rounded-full blur-3xl md:h-96 md:w-96"
          style={{
            top: '10%',
            left: '5%',
            background: 'radial-gradient(circle, rgba(var(--color-primary), 0.12) 0%, transparent 70%)',
            animation: 'v2-float-orb 30s ease-in-out infinite',
          }}
        />
        <div
          className="absolute h-64 w-64 rounded-full blur-3xl md:h-80 md:w-80"
          style={{
            top: '60%',
            right: '10%',
            background: 'radial-gradient(circle, rgba(var(--color-secondary), 0.10) 0%, transparent 70%)',
            animation: 'v2-float-orb 38s ease-in-out infinite reverse',
          }}
        />
        <div
          className="hidden h-56 w-56 rounded-full blur-3xl md:absolute md:block md:h-72 md:w-72"
          style={{
            bottom: '15%',
            left: '40%',
            background: 'radial-gradient(circle, rgba(var(--color-primary), 0.08) 0%, transparent 70%)',
            animation: 'v2-float-orb 45s ease-in-out infinite',
            animationDelay: '-15s',
          }}
        />
      </div>

      {/* Dot grid pattern overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgb(var(--color-text)) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Content layer */}
      <div className="relative z-10">
        <LandingHeader />

        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
          {/* V2 Preview badge */}
          <div className="sticky top-16 z-20 flex justify-center py-3">
            <Link
              href="/stundenplan/dashboard"
              className="v2-badge-glow inline-flex items-center gap-2 rounded-full border border-[rgba(var(--color-primary),0.2)] bg-[rgba(var(--color-surface),0.7)] px-4 py-1.5 text-sm font-medium text-[rgb(var(--color-text))] shadow-sm backdrop-blur-md transition-colors hover:bg-[rgba(var(--color-surface),0.9)]"
              style={{
                animation: 'v2-badge-glow 3s ease-in-out infinite',
              }}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-[rgb(var(--color-primary))]" />
              V2 Preview
              <span className="text-[rgb(var(--color-text-secondary))]">&larr; Back to original</span>
            </Link>
          </div>

          <main id="main-content" className="py-10 md:py-12">
            {/* Animated gradient border wrapper */}
            <div
              className="v2-gradient-border rounded-xl p-[2px]"
              style={{
                background:
                  'linear-gradient(var(--v2-border-angle, 0deg), rgba(var(--color-primary), 0.4), rgba(var(--color-secondary), 0.2), rgba(var(--color-primary), 0.4))',
                backgroundSize: '300% 300%',
                animation: 'v2-gradient-border 15s linear infinite',
              }}
            >
              <div className="rounded-[10px] bg-[rgb(var(--color-background))]">
                <DashboardClient initialScope={scope} isAuthenticated={Boolean(user)} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
