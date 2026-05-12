import { TimetableOnboarding } from '@/components/stundenplan/timetable-onboarding';
import { redirectIfAdminSetupRequired, requireSignedInUser } from '@/lib/stundenplan-page-guards';

export default async function StundenplanEditPage() {
  const user = await requireSignedInUser();
  await redirectIfAdminSetupRequired(user);

  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <section className="rounded-3xl border border-[rgb(var(--color-border)/0.2)] bg-[rgb(var(--color-surface))] p-5 md:p-7">
        <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--color-text))]">Stundenplan bearbeiten</h1>
        <p className="mt-2 text-sm text-[rgb(var(--color-text-secondary))]">
          Bearbeite deinen bestehenden Stundenplan. Änderungen wirken direkt auf deine personalisierten Vertretungen.
        </p>

        <div className="mt-6">
          <TimetableOnboarding mode="edit" />
        </div>
      </section>
    </main>
  );
}
