import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  const auth = await requireUser();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  try {
    const body = (await req.json()) as { endpoint?: string };
    const endpoint = String(body.endpoint ?? '').trim();

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint fehlt.' }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: auth.user.id,
      },
    });

    const count = await prisma.pushSubscription.count({
      where: {
        userId: auth.user.id,
      },
    });

    if (count === 0) {
      await prisma.user.update({
        where: { id: auth.user.id },
        data: {
          notificationsEnabled: false,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete push subscription', error);
    return NextResponse.json({ error: 'Push-Subscription konnte nicht gelöscht werden.' }, { status: 500 });
  }
}
