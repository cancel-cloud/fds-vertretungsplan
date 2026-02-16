import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireUser();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: auth.user.id,
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

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Failed to load push subscriptions', error);
    return NextResponse.json({ error: 'Push-Geräte konnten nicht geladen werden.' }, { status: 500 });
  }
}
