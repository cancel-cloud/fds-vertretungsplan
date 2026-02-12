import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { getVapidPublicKey } from '@/lib/push';

export async function GET() {
  const vapidPublicKey = getVapidPublicKey();
  if (!vapidPublicKey) {
    return NextResponse.json({ error: 'Push ist nicht konfiguriert.' }, { status: 503 });
  }

  return NextResponse.json({ vapidPublicKey });
}

export async function POST(req: NextRequest) {
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

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        endpoint,
        p256dh,
        auth: authKey,
        userId: auth.user.id,
        userAgent: req.headers.get('user-agent'),
        lastSeenAt: new Date(),
      },
      update: {
        p256dh,
        auth: authKey,
        userId: auth.user.id,
        userAgent: req.headers.get('user-agent'),
        lastSeenAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to save push subscription', error);
    return NextResponse.json({ error: 'Push-Subscription konnte nicht gespeichert werden.' }, { status: 500 });
  }
}
