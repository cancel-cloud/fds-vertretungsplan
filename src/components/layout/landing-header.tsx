import { getServerAuthSession } from '@/lib/auth';
import { LandingHeaderClient } from '@/components/layout/landing-header-client';

export async function LandingHeader() {
  const session = await getServerAuthSession();
  const hasSession = Boolean(session?.user?.id);
  const userRole = session?.user?.role === 'ADMIN' ? 'ADMIN' : 'USER';

  return <LandingHeaderClient hasSession={hasSession} userRole={userRole} />;
}
