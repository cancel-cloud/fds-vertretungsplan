import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { AdminSetup } from '@/components/stundenplan/admin-setup';

export default async function StundenplanAdminSetupPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/stundenplan/login');
  }

  if (user.role !== 'ADMIN') {
    redirect('/stundenplan/onboarding');
  }

  const teacherCount = await prisma.teacherDirectory.count();
  if (teacherCount > 0) {
    if (!user.onboardingCompletedAt && !user.onboardingSkippedAt) {
      redirect('/stundenplan/onboarding');
    }
    redirect('/stundenplan/dashboard');
  }

  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <section className="rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--color-text))]">Admin-Ersteinrichtung</h1>
        <p className="mt-2 text-sm text-[rgb(var(--color-text-secondary))]">
          Hinterlege zuerst Lehrer-Kürzel und volle Namen. Danach geht es ins normale Onboarding.
        </p>

        <div className="mt-6">
          <AdminSetup />
        </div>
      </section>
    </main>
  );
}
