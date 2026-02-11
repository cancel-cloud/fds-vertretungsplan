import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/guards';
import { DashboardClient } from '@/components/stundenplan/dashboard-client';
import { prisma } from '@/lib/prisma';

export default async function StundenplanDashboardPage() {
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
    <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <DashboardClient />
    </main>
  );
}
