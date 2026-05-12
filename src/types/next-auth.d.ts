import type { AuthSessionUser, AuthTokenClaims } from '@/types/user-system';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: AuthSessionUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: AuthTokenClaims['id'];
    role?: AuthTokenClaims['role'];
    onboardingCompletedAt?: AuthTokenClaims['onboardingCompletedAt'];
    onboardingSkippedAt?: AuthTokenClaims['onboardingSkippedAt'];
    notificationsEnabled?: AuthTokenClaims['notificationsEnabled'];
    notificationLookaheadSchoolDays?: AuthTokenClaims['notificationLookaheadSchoolDays'];
  }
}
