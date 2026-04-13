import webPush from 'web-push';

let configured = false;

export function getPushAppName(): string {
  const fromEnv = process.env.PUSH_APP_NAME?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : 'FDS Stundenplan';
}

export function configureWebPush() {
  if (configured) {
    return;
  }

  const subject = process.env.VAPID_SUBJECT ?? 'mailto:admin@fds.local';
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return;
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

export function isPushWindow(date: Date): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) {
    return false;
  }

  const hour = date.getHours();
  return hour >= 6 && hour < 20;
}

export interface PushDelivery {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendPushMessage(
  subscription: PushDelivery,
  payload?: Record<string, unknown> | null
): Promise<{ ok: true } | { ok: false; remove: boolean; statusCode?: number; reason?: string }> {
  configureWebPush();

  if (!configured) {
    return { ok: false, remove: false, reason: 'Web Push ist nicht konfiguriert (VAPID fehlt).' };
  }

  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    const body = payload && Object.keys(payload).length > 0 ? JSON.stringify(payload) : undefined;
    await webPush.sendNotification(pushSubscription, body, {
      TTL: 120,
      urgency: 'high',
    });

    return { ok: true };
  } catch (error) {
    const statusCode = typeof error === 'object' && error && 'statusCode' in error
      ? Number((error as { statusCode?: unknown }).statusCode)
      : undefined;
    const reason =
      typeof error === 'object' && error && 'message' in error
        ? String((error as { message?: unknown }).message ?? '')
        : 'Unbekannter Push-Fehler';

    const remove = statusCode === 404 || statusCode === 410;
    return { ok: false, remove, statusCode, reason };
  }
}
