import { redirect } from 'next/navigation';
import {
  redirectIfAdminSetupRequired,
  redirectIfOnboardingIncomplete,
  requireSignedInUser,
} from '@/lib/stundenplan-page-guards';

export default async function StundenplanRootPage() {
  const user = await requireSignedInUser();
  await redirectIfAdminSetupRequired(user);
  redirectIfOnboardingIncomplete(user);

  redirect('/stundenplan/dashboard');
}
