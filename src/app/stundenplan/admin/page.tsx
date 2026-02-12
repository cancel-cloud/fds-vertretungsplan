import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/guards';
import { AdminPanel } from '@/components/stundenplan/admin-panel';

export default async function StundenplanAdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/stundenplan/login');
  }

  if (user.role !== 'ADMIN') {
    redirect('/stundenplan/dashboard');
  }

  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-4">
        <Link href="/stundenplan/dashboard" className="text-sm font-medium text-[rgb(var(--color-primary))] hover:underline">
          Zurück zum Dashboard
        </Link>
      </div>
      <AdminPanel />
    </main>
  );
}
