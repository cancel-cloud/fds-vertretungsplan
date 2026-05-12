import { User } from '@prisma/client';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

export const hasCompletedOnboarding = (user: Pick<User, 'onboardingCompletedAt' | 'onboardingSkippedAt'>): boolean =>
  Boolean(user.onboardingCompletedAt || user.onboardingSkippedAt);

export async function requireSignedInUser(loginPath = '/stundenplan/login') {
  const user = await getOptionalSignedInUser();

  if (!user) {
    redirect(loginPath);
  }

  return user;
}

export async function getOptionalSignedInUser() {
  return getCurrentUser();
}

export async function redirectIfBootstrapAdminRegistrationRequired() {
  const adminCount = await prisma.user.count({
    where: {
      role: 'ADMIN',
    },
  });

  if (adminCount === 0) {
    redirect('/stundenplan/register');
  }
}

export async function redirectIfAdminSetupRequired(user: Pick<User, 'role'>) {
  if (user.role !== 'ADMIN') {
    return;
  }

  const teacherCount = await prisma.teacherDirectory.count();
  if (teacherCount === 0) {
    redirect('/stundenplan/admin-setup');
  }
}

export function redirectIfOnboardingIncomplete(user: Pick<User, 'onboardingCompletedAt' | 'onboardingSkippedAt'>) {
  if (!hasCompletedOnboarding(user)) {
    redirect('/stundenplan/onboarding');
  }
}

export function redirectIfOnboardingComplete(user: Pick<User, 'onboardingCompletedAt' | 'onboardingSkippedAt'>) {
  if (hasCompletedOnboarding(user)) {
    redirect('/stundenplan/dashboard');
  }
}
