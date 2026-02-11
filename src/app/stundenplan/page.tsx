import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

export default async function StundenplanRootPage() {
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

  if (!user.onboardingCompletedAt && !user.onboardingSkippedAt) {
    redirect('/stundenplan/onboarding');
  }

  redirect('/stundenplan/dashboard');
}
