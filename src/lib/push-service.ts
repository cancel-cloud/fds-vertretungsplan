import { prisma } from '@/lib/prisma';
import { sendPushMessage, type PushDelivery } from '@/lib/push';

export interface PushSubscriptionInput {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string | null;
}

export interface PushSubscriptionSummary {
  id: string;
  endpoint: string;
  userAgent: string | null;
  createdAt: Date;
  lastSeenAt: Date;
}

export interface PushDeliverySubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushSendFailure {
  endpoint: string;
  statusCode?: number;
  reason?: string;
}

export interface PushSendBatchResult {
  sent: number;
  removedEndpoints: string[];
  failures: PushSendFailure[];
}

export async function savePushSubscription(input: PushSubscriptionInput): Promise<void> {
  await prisma.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    create: {
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      userId: input.userId,
      userAgent: input.userAgent,
      lastSeenAt: new Date(),
    },
    update: {
      p256dh: input.p256dh,
      auth: input.auth,
      userId: input.userId,
      userAgent: input.userAgent,
      lastSeenAt: new Date(),
    },
  });
}

export async function listPushSubscriptionsForUser(
  userId: string,
  options?: { endpoint?: string }
): Promise<PushSubscriptionSummary[]> {
  return prisma.pushSubscription.findMany({
    where: {
      userId,
      ...(options?.endpoint ? { endpoint: options.endpoint } : {}),
    },
    select: {
      id: true,
      endpoint: true,
      userAgent: true,
      createdAt: true,
      lastSeenAt: true,
    },
    orderBy: {
      lastSeenAt: 'desc',
    },
  });
}

export async function listPushDeliverySubscriptionsForUser(
  userId: string,
  options?: { endpoint?: string }
): Promise<PushDeliverySubscription[]> {
  return prisma.pushSubscription.findMany({
    where: {
      userId,
      ...(options?.endpoint ? { endpoint: options.endpoint } : {}),
    },
    select: {
      endpoint: true,
      p256dh: true,
      auth: true,
    },
    orderBy: {
      lastSeenAt: 'desc',
    },
  });
}

export async function removePushSubscriptionForUser(
  userId: string,
  endpoint: string
): Promise<{ removedCount: number; remainingSubscriptions: number }> {
  const removed = await prisma.pushSubscription.deleteMany({
    where: {
      endpoint,
      userId,
    },
  });

  const remainingSubscriptions = await prisma.pushSubscription.count({
    where: {
      userId,
    },
  });

  if (remainingSubscriptions === 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        notificationsEnabled: false,
      },
    });
  }

  return {
    removedCount: removed.count,
    remainingSubscriptions,
  };
}

export async function removePushSubscriptionsForUser(userId: string, endpoints: string[]): Promise<number> {
  if (endpoints.length === 0) {
    return 0;
  }

  const removed = await prisma.pushSubscription.deleteMany({
    where: {
      endpoint: {
        in: endpoints,
      },
      userId,
    },
  });

  return removed.count;
}

export async function getLastPushTarget(userId: string): Promise<{
  targetDate: number | null;
  sentAt: string | null;
  url: string;
}> {
  const latestState = await prisma.notificationState.findFirst({
    where: { userId },
    orderBy: { lastSentAt: 'desc' },
    select: {
      targetDate: true,
      lastSentAt: true,
    },
  });

  if (latestState) {
    const dateParam = String(latestState.targetDate);
    return {
      targetDate: latestState.targetDate,
      sentAt: latestState.lastSentAt.toISOString(),
      url: `/stundenplan/dashboard?date=${dateParam}`,
    };
  }

  const latestFingerprint = await prisma.notificationFingerprint.findFirst({
    where: { userId },
    orderBy: { sentAt: 'desc' },
    select: {
      targetDate: true,
      sentAt: true,
    },
  });

  if (!latestFingerprint) {
    return { targetDate: null, sentAt: null, url: '/stundenplan/dashboard' };
  }

  const dateParam = String(latestFingerprint.targetDate);
  return {
    targetDate: latestFingerprint.targetDate,
    sentAt: latestFingerprint.sentAt.toISOString(),
    url: `/stundenplan/dashboard?date=${dateParam}`,
  };
}

export async function sendPushBatch(
  subscriptions: PushDelivery[],
  payload?: Record<string, unknown> | null
): Promise<PushSendBatchResult> {
  let sent = 0;
  const removedEndpoints: string[] = [];
  const failures: PushSendFailure[] = [];
  const messagePayload = payload ?? null;

  for (const subscription of subscriptions) {
    const result = await sendPushMessage(subscription, messagePayload);

    if (result.ok) {
      sent += 1;
    } else if (result.remove) {
      removedEndpoints.push(subscription.endpoint);
    } else {
      failures.push({
        endpoint: subscription.endpoint,
        statusCode: result.statusCode,
        reason: result.reason,
      });
    }
  }

  return {
    sent,
    removedEndpoints,
    failures,
  };
}
