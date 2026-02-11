import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import {
  MAX_NOTIFICATION_LOOKAHEAD_SCHOOL_DAYS,
  MIN_NOTIFICATION_LOOKAHEAD_SCHOOL_DAYS,
} from '@/lib/notification-state';
import { prisma } from '@/lib/prisma';
import { toAuthUserDto } from '@/lib/user-system-mappers';

export async function GET() {
  const auth = await requireUser();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  return NextResponse.json({ user: toAuthUserDto(auth.user) });
}

export async function PUT(req: NextRequest) {
  const auth = await requireUser();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  try {
    const body = (await req.json()) as {
      onboardingCompleted?: boolean;
      onboardingSkipped?: boolean;
      notificationsEnabled?: boolean;
      notificationLookaheadSchoolDays?: number;
    };

    const now = new Date();

    const data: {
      onboardingCompletedAt?: Date | null;
      onboardingSkippedAt?: Date | null;
      notificationsEnabled?: boolean;
      notificationLookaheadSchoolDays?: number;
    } = {};

    if (typeof body.onboardingCompleted === 'boolean') {
      data.onboardingCompletedAt = body.onboardingCompleted ? now : null;
      if (body.onboardingCompleted) {
        data.onboardingSkippedAt = null;
      }
    }

    if (typeof body.onboardingSkipped === 'boolean') {
      data.onboardingSkippedAt = body.onboardingSkipped ? now : null;
    }

    if (typeof body.notificationsEnabled === 'boolean') {
      data.notificationsEnabled = body.notificationsEnabled;
    }

    if (body.notificationLookaheadSchoolDays !== undefined) {
      const value = Number(body.notificationLookaheadSchoolDays);
      if (
        !Number.isInteger(value) ||
        value < MIN_NOTIFICATION_LOOKAHEAD_SCHOOL_DAYS ||
        value > MAX_NOTIFICATION_LOOKAHEAD_SCHOOL_DAYS
      ) {
        return NextResponse.json(
          {
            error: `notificationLookaheadSchoolDays muss zwischen ${MIN_NOTIFICATION_LOOKAHEAD_SCHOOL_DAYS} und ${MAX_NOTIFICATION_LOOKAHEAD_SCHOOL_DAYS} liegen.`,
          },
          { status: 400 }
        );
      }

      data.notificationLookaheadSchoolDays = value;
    }

    const updated = await prisma.user.update({
      where: { id: auth.user.id },
      data,
    });

    return NextResponse.json({ user: toAuthUserDto(updated) });
  } catch (error) {
    console.error('Failed to update user profile', error);
    return NextResponse.json({ error: 'Profil konnte nicht aktualisiert werden.' }, { status: 500 });
  }
}
