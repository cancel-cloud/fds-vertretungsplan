import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/guards';
import { TimetableOnboarding } from '@/components/stundenplan/timetable-onboarding';
import { prisma } from '@/lib/prisma';

export default async function StundenplanOnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/stundenplan/login');
  }

  if (user.role === 'ADMIN') {
    const teacherCount = await prisma.teacherDirectory.count();
    if (teacherCount === 0) {
      redirect('/stundenplan/admin-setup');
    }
  }

  if (user.onboardingCompletedAt || user.onboardingSkippedAt) {
    redirect('/stundenplan/dashboard');
  }

  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <section className="rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--color-text))]">Onboarding: Dein Stundenplan</h1>
        <p className="mt-2 text-sm text-[rgb(var(--color-text-secondary))]">
          Trage für Montag bis Freitag deine Stunden ein. Du kannst Einzel- oder Doppelstunden hinzufügen und zwischen jeder, gerader oder ungerader Woche wählen.
        </p>

        <div className="mt-6">
          <TimetableOnboarding mode="onboarding" />
        </div>
      </section>
    </main>
  );
}
