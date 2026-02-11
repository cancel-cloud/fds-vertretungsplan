import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

function toDateParam(targetDate: number): string {
  return String(targetDate);
}

export async function GET() {
  const auth = await requireUser();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  const latestState = await prisma.notificationState.findFirst({
    where: { userId: auth.user.id },
    orderBy: { lastSentAt: 'desc' },
    select: {
      targetDate: true,
      lastSentAt: true,
    },
  });

  if (latestState) {
    const dateParam = toDateParam(latestState.targetDate);
    return NextResponse.json({
      targetDate: latestState.targetDate,
      sentAt: latestState.lastSentAt.toISOString(),
      url: `/stundenplan/dashboard?date=${dateParam}`,
    });
  }

  const latestFingerprint = await prisma.notificationFingerprint.findFirst({
    where: { userId: auth.user.id },
    orderBy: { sentAt: 'desc' },
    select: {
      targetDate: true,
      sentAt: true,
    },
  });

  if (!latestFingerprint) {
    return NextResponse.json({ targetDate: null, sentAt: null, url: '/stundenplan/dashboard' });
  }

  const dateParam = toDateParam(latestFingerprint.targetDate);
  return NextResponse.json({
    targetDate: latestFingerprint.targetDate,
    sentAt: latestFingerprint.sentAt.toISOString(),
    url: `/stundenplan/dashboard?date=${dateParam}`,
  });
}
