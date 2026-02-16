import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const normalizePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  const requestedPage = normalizePositiveInt(req.nextUrl.searchParams.get('page'), 1);
  const requestedPageSize = normalizePositiveInt(req.nextUrl.searchParams.get('pageSize'), DEFAULT_PAGE_SIZE);
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  const total = await prisma.user.count();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const users = await prisma.user.findMany({
    orderBy: [{ role: 'desc' }, { email: 'asc' }],
    include: {
      _count: {
        select: {
          timetableEntries: true,
          pushSubscriptions: true,
        },
      },
    },
    skip,
    take: pageSize,
  });
  const userIds = users.map((user) => user.id);

  const [fingerprintStats, notificationStateStats, subscriptionStats] = await Promise.all([
    userIds.length > 0
      ? prisma.notificationFingerprint.groupBy({
          by: ['userId'],
          where: {
            userId: { in: userIds },
          },
          _count: {
            _all: true,
          },
          _max: {
            sentAt: true,
            targetDate: true,
          },
        })
      : Promise.resolve([]),
    userIds.length > 0
      ? prisma.notificationState.groupBy({
          by: ['userId'],
          where: {
            userId: { in: userIds },
          },
          _count: {
            _all: true,
          },
          _max: {
            lastSentAt: true,
            targetDate: true,
          },
        })
      : Promise.resolve([]),
    userIds.length > 0
      ? prisma.pushSubscription.groupBy({
          by: ['userId'],
          where: {
            userId: { in: userIds },
          },
          _max: {
            lastSeenAt: true,
            updatedAt: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const fingerprintStatsByUser = new Map(fingerprintStats.map((stat) => [stat.userId, stat]));
  const notificationStateStatsByUser = new Map(notificationStateStats.map((stat) => [stat.userId, stat]));
  const subscriptionStatsByUser = new Map(subscriptionStats.map((stat) => [stat.userId, stat]));

  return NextResponse.json({
    users: users.map((user) => ({
      notificationStats: {
        totalFingerprints: fingerprintStatsByUser.get(user.id)?._count._all ?? 0,
        activeStates: notificationStateStatsByUser.get(user.id)?._count._all ?? 0,
        lastSentAt:
          notificationStateStatsByUser.get(user.id)?._max.lastSentAt?.toISOString() ??
          fingerprintStatsByUser.get(user.id)?._max.sentAt?.toISOString() ??
          null,
        lastTargetDate:
          notificationStateStatsByUser.get(user.id)?._max.targetDate ??
          fingerprintStatsByUser.get(user.id)?._max.targetDate ??
          null,
      },
      subscriptionStats: {
        lastSeenAt: subscriptionStatsByUser.get(user.id)?._max.lastSeenAt?.toISOString() ?? null,
        lastUpdatedAt: subscriptionStatsByUser.get(user.id)?._max.updatedAt?.toISOString() ?? null,
      },
      id: user.id,
      email: user.email,
      role: user.role,
      onboardingCompletedAt: user.onboardingCompletedAt?.toISOString() ?? null,
      onboardingSkippedAt: user.onboardingSkippedAt?.toISOString() ?? null,
      notificationsEnabled: user.notificationsEnabled,
      notificationLookaheadSchoolDays: user.notificationLookaheadSchoolDays,
      timetableCount: user._count.timetableEntries,
      pushSubscriptionCount: user._count.pushSubscriptions,
      createdAt: user.createdAt.toISOString(),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  try {
    const body = (await req.json()) as {
      id?: string;
      role?: 'USER' | 'ADMIN';
      notificationsEnabled?: boolean;
      notificationLookaheadSchoolDays?: number;
    };

    const id = String(body.id ?? '').trim();
    if (!id) {
      return NextResponse.json({ error: 'User-ID fehlt.' }, { status: 400 });
    }

    const updates: {
      role?: 'USER' | 'ADMIN';
      notificationsEnabled?: boolean;
      notificationLookaheadSchoolDays?: number;
    } = {};

    if (body.role === 'USER' || body.role === 'ADMIN') {
      updates.role = body.role;
    }

    if (typeof body.notificationsEnabled === 'boolean') {
      updates.notificationsEnabled = body.notificationsEnabled;
    }

    if (body.notificationLookaheadSchoolDays !== undefined) {
      const lookahead = Number(body.notificationLookaheadSchoolDays);
      if (!Number.isInteger(lookahead) || lookahead < 1 || lookahead > 5) {
        return NextResponse.json({ error: 'Lookahead muss zwischen 1 und 5 liegen.' }, { status: 400 });
      }
      updates.notificationLookaheadSchoolDays = lookahead;
    }

    if (
      !updates.role &&
      typeof updates.notificationsEnabled !== 'boolean' &&
      typeof updates.notificationLookaheadSchoolDays !== 'number'
    ) {
      return NextResponse.json({ error: 'Keine Änderungen übergeben.' }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (updates.role === 'USER') {
        const user = await tx.user.findUnique({
          where: { id },
          select: { role: true },
        });

        if (!user) {
          throw new Error('NOT_FOUND');
        }

        if (user.role === 'ADMIN') {
          const adminCount = await tx.user.count({ where: { role: 'ADMIN' } });
          if (adminCount <= 1) {
            throw new Error('LAST_ADMIN');
          }
        }
      }

      return tx.user.update({
        where: { id },
        data: updates,
        include: {
          _count: {
            select: {
              timetableEntries: true,
              pushSubscriptions: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      user: {
        notificationStats: null,
        subscriptionStats: null,
        id: updated.id,
        email: updated.email,
        role: updated.role,
        onboardingCompletedAt: updated.onboardingCompletedAt?.toISOString() ?? null,
        onboardingSkippedAt: updated.onboardingSkippedAt?.toISOString() ?? null,
        notificationsEnabled: updated.notificationsEnabled,
        notificationLookaheadSchoolDays: updated.notificationLookaheadSchoolDays,
        timetableCount: updated._count.timetableEntries,
        pushSubscriptionCount: updated._count.pushSubscriptions,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'User wurde nicht gefunden.' }, { status: 404 });
      }
      if (error.message === 'LAST_ADMIN') {
        return NextResponse.json({ error: 'Der letzte Admin kann nicht herabgestuft werden.' }, { status: 400 });
      }
    }
    console.error('Failed to update user from admin panel', error);
    return NextResponse.json({ error: 'Benutzer konnte nicht aktualisiert werden.' }, { status: 500 });
  }
}
