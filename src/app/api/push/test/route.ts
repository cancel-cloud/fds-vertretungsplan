import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { getPushAppName, sendPushMessage } from '@/lib/push';
import { enforceSameOrigin } from '@/lib/security/request-integrity';

export async function POST(req: Request) {
  const invalidOriginResponse = enforceSameOrigin(req);
  if (invalidOriginResponse) {
    return invalidOriginResponse;
  }

  const auth = await requireUser();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  let endpointFilter: string | null = null;
  let directSubscription:
    | {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      }
    | null = null;
  try {
    const body = (await req.json()) as {
      endpoint?: unknown;
      subscription?: {
        endpoint?: unknown;
        keys?: {
          p256dh?: unknown;
          auth?: unknown;
        };
      };
    };
    if (typeof body.endpoint === 'string' && body.endpoint.trim().length > 0) {
      endpointFilter = body.endpoint.trim();
    }

    const sub = body.subscription;
    const endpoint = typeof sub?.endpoint === 'string' ? sub.endpoint.trim() : '';
    const p256dh = typeof sub?.keys?.p256dh === 'string' ? sub.keys.p256dh.trim() : '';
    const authKey = typeof sub?.keys?.auth === 'string' ? sub.keys.auth.trim() : '';
    if (endpoint && p256dh && authKey) {
      directSubscription = {
        endpoint,
        keys: {
          p256dh,
          auth: authKey,
        },
      };
    }
  } catch {
    endpointFilter = null;
  }

  if (directSubscription) {
    await prisma.pushSubscription.upsert({
      where: { endpoint: directSubscription.endpoint },
      create: {
        endpoint: directSubscription.endpoint,
        p256dh: directSubscription.keys.p256dh,
        auth: directSubscription.keys.auth,
        userId: auth.user.id,
        userAgent: req.headers.get('user-agent'),
        lastSeenAt: new Date(),
      },
      update: {
        p256dh: directSubscription.keys.p256dh,
        auth: directSubscription.keys.auth,
        userId: auth.user.id,
        userAgent: req.headers.get('user-agent'),
        lastSeenAt: new Date(),
      },
    });
  }

  const subscriptions = directSubscription
    ? [
        {
          endpoint: directSubscription.endpoint,
          p256dh: directSubscription.keys.p256dh,
          auth: directSubscription.keys.auth,
        },
      ]
    : await prisma.pushSubscription.findMany({
    where: endpointFilter
      ? {
          userId: auth.user.id,
          endpoint: endpointFilter,
        }
      : { userId: auth.user.id },
  });

  if (subscriptions.length === 0) {
    return NextResponse.json(
      {
        error: endpointFilter
          ? 'Keine Push-Subscription für dieses Gerät gefunden. Bitte Push erneut aktivieren.'
          : 'Keine Push-Subscription vorhanden.',
      },
      { status: 400 }
    );
  }

  let sent = 0;
  const appName = getPushAppName();
  const traceId = crypto.randomUUID();
  const removeEndpoints: string[] = [];
  const failures: Array<{ endpoint: string; statusCode?: number; reason?: string }> = [];

  for (const subscription of subscriptions) {
    const result = await sendPushMessage(
      {
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
      {
        title: `${appName} · Test`,
        body: 'Dies ist eine Test-Benachrichtigung.',
        url: '/stundenplan/dashboard',
        tag: `fds-test-${traceId}`,
        traceId,
      }
    );

    if (result.ok) {
      sent += 1;
    } else if (result.remove) {
      removeEndpoints.push(subscription.endpoint);
    } else {
      failures.push({
        endpoint: subscription.endpoint,
        statusCode: result.statusCode,
        reason: result.reason,
      });
    }
  }

  if (removeEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint: {
          in: removeEndpoints,
        },
      },
    });
  }

  if (sent === 0 && failures.length > 0) {
    return NextResponse.json(
      {
        error: 'Push konnte nicht zugestellt werden. Bitte Browser-Subscription prüfen.',
        sent,
        removed: removeEndpoints.length,
        traceId,
        failures,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    sent,
    removed: removeEndpoints.length,
    traceId,
    appName,
    failures,
  });
}
