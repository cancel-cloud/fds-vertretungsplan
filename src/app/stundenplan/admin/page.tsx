import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/guards';
import { AdminPanel } from '@/components/stundenplan/admin-panel';
import { isDemoMode } from '@/lib/demo-config';

export default async function StundenplanAdminPage() {
  const user = await getCurrentUser();
  const demoMode = isDemoMode();

  if (!user) {
    redirect('/stundenplan/login');
  }

  if (user.role !== 'ADMIN') {
    redirect('/stundenplan/dashboard');
  }

  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-6">
        <Link href="/stundenplan/dashboard" className="text-sm font-medium text-[rgb(var(--color-primary))] hover:underline">
          Zurück zum Dashboard
        </Link>
      </div>
      <AdminPanel currentUserId={user.id} isDemoMode={demoMode} />
    </main>
  );
}
