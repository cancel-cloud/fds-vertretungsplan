import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { consumeRateLimit, resetRateLimit, resolveClientIp } from '@/lib/security/rate-limit';

export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_PER_IP = 20;
const LOGIN_RATE_LIMIT_PER_EMAIL_IP = 8;

const getNormalizedAdminEmails = (): string[] => {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
};

export const getAdminEmailSet = (): Set<string> => new Set(getNormalizedAdminEmails());

export const isAdminEmail = (email: string): boolean => getAdminEmailSet().has(normalizeEmail(email));

export const getBootstrapAdminEmail = (): string | null => {
  const [first] = getNormalizedAdminEmails();
  return first ?? null;
};

const getAuthHeaderRecord = (requestLike: unknown): Record<string, string | string[] | undefined> | undefined => {
  if (!requestLike || typeof requestLike !== 'object') {
    return undefined;
  }

  const rawHeaders = (requestLike as { headers?: unknown }).headers;
  if (!rawHeaders || typeof rawHeaders !== 'object') {
    return undefined;
  }

  return rawHeaders as Record<string, string | string[] | undefined>;
};

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
      async authorize(credentials, requestLike) {
        const email = normalizeEmail(credentials?.email ?? '');
        const password = credentials?.password ?? '';
        const headers = getAuthHeaderRecord(requestLike);
        const clientIp = resolveClientIp(headers);
        const ipRateLimit = consumeRateLimit({
          key: `login:ip:${clientIp}`,
          limit: LOGIN_RATE_LIMIT_PER_IP,
          windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
        });
        if (!ipRateLimit.allowed) {
          return null;
        }

        if (!email || !password) {
          return null;
        }

        const emailIpRateLimitKey = `login:email-ip:${email}:${clientIp}`;
        const emailIpRateLimit = consumeRateLimit({
          key: emailIpRateLimitKey,
          limit: LOGIN_RATE_LIMIT_PER_EMAIL_IP,
          windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
        });
        if (!emailIpRateLimit.allowed) {
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

        resetRateLimit(emailIpRateLimitKey);

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
