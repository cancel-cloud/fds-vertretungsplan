import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { getVapidPublicKey } from '@/lib/push';
import { enforceSameOrigin } from '@/lib/security/request-integrity';
import { savePushSubscription } from '@/lib/push-service';

export async function GET() {
  const vapidPublicKey = getVapidPublicKey();
  if (!vapidPublicKey) {
    return NextResponse.json({ error: 'Push ist nicht konfiguriert.' }, { status: 503 });
  }

  return NextResponse.json({ vapidPublicKey });
}

export async function POST(req: NextRequest) {
  const invalidOriginResponse = enforceSameOrigin(req);
  if (invalidOriginResponse) {
    return invalidOriginResponse;
  }

  const auth = await requireUser();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  try {
    const body = (await req.json()) as {
      endpoint?: string;
      keys?: {
        p256dh?: string;
        auth?: string;
      };
    };

    const endpoint = String(body.endpoint ?? '').trim();
    const p256dh = String(body.keys?.p256dh ?? '').trim();
    const authKey = String(body.keys?.auth ?? '').trim();

    if (!endpoint || !p256dh || !authKey) {
      return NextResponse.json({ error: 'Ungültige Push-Subscription.' }, { status: 400 });
    }

    await savePushSubscription({
      userId: auth.user.id,
      endpoint,
      p256dh,
      auth: authKey,
      userAgent: req.headers.get('user-agent'),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to save push subscription', error);
    return NextResponse.json({ error: 'Push-Subscription konnte nicht gespeichert werden.' }, { status: 500 });
  }
}
