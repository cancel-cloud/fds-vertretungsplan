import { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: 'USER' | 'ADMIN';
      onboardingCompletedAt: string | null;
      onboardingSkippedAt: string | null;
      notificationsEnabled: boolean;
      notificationLookaheadSchoolDays: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'USER' | 'ADMIN';
    onboardingCompletedAt?: string | null;
    onboardingSkippedAt?: string | null;
    notificationsEnabled?: boolean;
    notificationLookaheadSchoolDays?: number;
  }
}
