import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth/guards';
import { isDemoMode } from '@/lib/demo-config';
import { prisma } from '@/lib/prisma';
import { enforceSameOrigin } from '@/lib/security/request-integrity';
import { DemoDatasetGenerationError, generateDemoDatasetForUser } from '@/lib/demo-substitutions';

export async function POST(req: NextRequest) {
  const invalidOriginResponse = enforceSameOrigin(req);
  if (invalidOriginResponse) {
    return invalidOriginResponse;
  }

  const auth = await requireAdmin();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  if (!isDemoMode()) {
    return NextResponse.json({ error: 'Demo-Daten können nur im APP_MODE=demo erzeugt werden.' }, { status: 400 });
  }

  try {
    const body = (await req.json()) as { userId?: string };
    const userId = String(body.userId ?? '').trim();
    if (!userId) {
      return NextResponse.json({ error: 'userId fehlt.' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        timetableEntries: {
          select: {
            weekday: true,
            startPeriod: true,
            duration: true,
            subjectCode: true,
            teacherCode: true,
            room: true,
            weekMode: true,
          },
          orderBy: [{ weekday: 'asc' }, { startPeriod: 'asc' }],
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden.' }, { status: 404 });
    }

    if (targetUser.timetableEntries.length === 0) {
      return NextResponse.json({ error: 'Der Benutzer hat noch keinen Stundenplan.' }, { status: 400 });
    }

    const generated = generateDemoDatasetForUser(targetUser.id, targetUser.email, targetUser.timetableEntries);

    await prisma.appSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        allowedEmailDomains: [],
        demoDataset: generated.dataset as unknown as Prisma.InputJsonValue,
        demoDatasetUserId: targetUser.id,
        demoDatasetGeneratedAt: new Date(generated.dataset.generatedAt),
      },
      update: {
        demoDataset: generated.dataset as unknown as Prisma.InputJsonValue,
        demoDatasetUserId: targetUser.id,
        demoDatasetGeneratedAt: new Date(generated.dataset.generatedAt),
      },
    });

    return NextResponse.json({
      ok: true,
      generatedFor: {
        id: targetUser.id,
        email: targetUser.email,
      },
      selectedDates: generated.selectedDates,
      guarantees: generated.guarantees,
      days: Object.keys(generated.dataset.days).length,
    });
  } catch (error) {
    if (error instanceof DemoDatasetGenerationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Failed to generate demo data', error);
    return NextResponse.json({ error: 'Demo-Daten konnten nicht erzeugt werden.' }, { status: 500 });
  }
}
