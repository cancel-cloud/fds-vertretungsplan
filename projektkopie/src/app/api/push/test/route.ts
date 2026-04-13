import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { requireUser } from '@/lib/auth/guards';
import { getPushAppName } from '@/lib/push';
import { enforceSameOrigin } from '@/lib/security/request-integrity';
import {
  listPushDeliverySubscriptionsForUser,
  removePushSubscriptionsForUser,
  savePushSubscription,
  sendPushBatch,
} from '@/lib/push-service';

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
    await savePushSubscription({
      userId: auth.user.id,
      endpoint: directSubscription.endpoint,
      p256dh: directSubscription.keys.p256dh,
      auth: directSubscription.keys.auth,
      userAgent: req.headers.get('user-agent'),
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
    : await listPushDeliverySubscriptionsForUser(
        auth.user.id,
        endpointFilter ? { endpoint: endpointFilter } : undefined
      );

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
  const { sent: sentCount, removedEndpoints, failures } = await sendPushBatch(subscriptions, {
    title: `${appName} · Test`,
    body: 'Dies ist eine Test-Benachrichtigung.',
    url: '/stundenplan/dashboard',
    tag: `fds-test-${traceId}`,
    traceId,
  });
  sent = sentCount;

  if (removedEndpoints.length > 0) {
    await removePushSubscriptionsForUser(auth.user.id, removedEndpoints);
  }

  if (sent === 0 && failures.length > 0) {
    return NextResponse.json(
      {
        error: 'Push konnte nicht zugestellt werden. Bitte Browser-Subscription prüfen.',
        sent,
        removed: removedEndpoints.length,
        traceId,
        failures,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    sent,
    removed: removedEndpoints.length,
    traceId,
    appName,
    failures,
  });
}
