import { redirect } from 'next/navigation';
import { UserSettingsPanel } from '@/components/stundenplan/user-settings-panel';
import { getCurrentUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

export default async function StundenplanSettingsPage() {
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

  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <section className="rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--color-text))]">Einstellungen</h1>
        <p className="mt-2 text-sm text-[rgb(var(--color-text-secondary))]">
          Lege fest, ob Benachrichtigungen aktiv sind und für wie viele Schultage im Voraus geprüft werden soll.
        </p>

        <div className="mt-6">
          <UserSettingsPanel />
        </div>
      </section>
    </main>
  );
}
