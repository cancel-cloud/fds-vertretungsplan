import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const getAdminEmailSet = (): Set<string> => {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0)
  );
};

export const isAdminEmail = (email: string): boolean => getAdminEmailSet().has(normalizeEmail(email));

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/stundenplan/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'E-Mail', type: 'email' },
        password: { label: 'Passwort', type: 'password' },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email ?? '');
        const password = credentials?.password ?? '';

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          onboardingCompletedAt: user.onboardingCompletedAt?.toISOString() ?? null,
          onboardingSkippedAt: user.onboardingSkippedAt?.toISOString() ?? null,
          notificationsEnabled: user.notificationsEnabled,
          notificationLookaheadSchoolDays: user.notificationLookaheadSchoolDays,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (!token.id && typeof token.sub === 'string' && token.sub.length > 0) {
        token.id = token.sub;
      }

      if (user) {
        const authUser = user as {
          id: string;
          role?: 'USER' | 'ADMIN';
          onboardingCompletedAt?: string | null;
          onboardingSkippedAt?: string | null;
          notificationsEnabled?: boolean;
          notificationLookaheadSchoolDays?: number;
        };

        token.id = user.id;
        token.role = authUser.role ?? 'USER';
        token.onboardingCompletedAt = authUser.onboardingCompletedAt ?? null;
        token.onboardingSkippedAt = authUser.onboardingSkippedAt ?? null;
        token.notificationsEnabled = authUser.notificationsEnabled ?? false;
        token.notificationLookaheadSchoolDays = authUser.notificationLookaheadSchoolDays ?? 1;
      }

      if (trigger === 'update' && session?.user && token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            role: true,
            onboardingCompletedAt: true,
            onboardingSkippedAt: true,
            notificationsEnabled: true,
            notificationLookaheadSchoolDays: true,
          },
        });

        if (freshUser) {
          token.role = freshUser.role;
          token.onboardingCompletedAt = freshUser.onboardingCompletedAt?.toISOString() ?? null;
          token.onboardingSkippedAt = freshUser.onboardingSkippedAt?.toISOString() ?? null;
          token.notificationsEnabled = freshUser.notificationsEnabled;
          token.notificationLookaheadSchoolDays = freshUser.notificationLookaheadSchoolDays;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? token.sub ?? '';
        session.user.role = token.role ?? 'USER';
        session.user.onboardingCompletedAt = token.onboardingCompletedAt ?? null;
        session.user.onboardingSkippedAt = token.onboardingSkippedAt ?? null;
        session.user.notificationsEnabled = token.notificationsEnabled ?? false;
        session.user.notificationLookaheadSchoolDays = token.notificationLookaheadSchoolDays ?? 1;
      }

      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};

export const getServerAuthSession = () => getServerSession(authOptions);
