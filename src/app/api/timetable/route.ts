import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { TimetableValidationError, validateTimetableEntries } from '@/lib/timetable';
import { toTimetableEntryDto, toTimetablePresetDto } from '@/lib/user-system-mappers';

const buildPresetKey = (subjectCode: string, teacherCode: string, room: string): string =>
  `${subjectCode}|||${teacherCode}|||${room}`;

export async function GET() {
  const auth = await requireUser();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  const [entries, presets] = await Promise.all([
    prisma.timetableEntry.findMany({
      where: { userId: auth.user.id },
      include: {
        teacher: {
          select: { fullName: true },
        },
      },
      orderBy: [{ weekday: 'asc' }, { startPeriod: 'asc' }],
    }),
    prisma.timetablePreset.findMany({
      where: { userId: auth.user.id },
      orderBy: [{ usageCount: 'desc' }, { lastUsedAt: 'desc' }],
    }),
  ]);

  return NextResponse.json({
    entries: entries.map(toTimetableEntryDto),
    presets: presets.map(toTimetablePresetDto),
  });
}

export async function PUT(req: NextRequest) {
  const auth = await requireUser();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  try {
    const body = (await req.json()) as { entries?: unknown; skipped?: boolean; allowOverlaps?: boolean };
    const skipped = Boolean(body.skipped);
    const allowOverlaps = body.allowOverlaps === true;

    if (skipped) {
      await prisma.user.update({
        where: { id: auth.user.id },
        data: {
          onboardingSkippedAt: new Date(),
          onboardingCompletedAt: null,
          notificationsEnabled: false,
        },
      });

      await prisma.timetableEntry.deleteMany({ where: { userId: auth.user.id } });

      const presets = await prisma.timetablePreset.findMany({
        where: { userId: auth.user.id },
        orderBy: [{ usageCount: 'desc' }, { lastUsedAt: 'desc' }],
      });

      return NextResponse.json({ entries: [], presets: presets.map(toTimetablePresetDto) });
    }

    const normalizedEntries = validateTimetableEntries(body.entries ?? [], { allowOverlaps });

    const teacherCodes = [...new Set(normalizedEntries.map((entry) => entry.teacherCode))];
    const teachers = await prisma.teacherDirectory.findMany({
      where: {
        code: {
          in: teacherCodes,
        },
      },
      select: {
        id: true,
        code: true,
      },
    });
    const teacherMap = new Map(teachers.map((teacher) => [teacher.code, teacher.id]));

    await prisma.$transaction(async (tx) => {
      await tx.timetableEntry.deleteMany({ where: { userId: auth.user.id } });

      if (normalizedEntries.length > 0) {
        await tx.timetableEntry.createMany({
          data: normalizedEntries.map((entry) => ({
            userId: auth.user.id,
            weekday: entry.weekday,
            startPeriod: entry.startPeriod,
            duration: entry.duration,
            subjectCode: entry.subjectCode,
            teacherCode: entry.teacherCode,
            room: entry.room,
            weekMode: entry.weekMode,
            teacherId: teacherMap.get(entry.teacherCode) ?? null,
          })),
        });
      }

      await tx.user.update({
        where: { id: auth.user.id },
        data: {
          onboardingCompletedAt: new Date(),
          onboardingSkippedAt: null,
          notificationsEnabled: normalizedEntries.length > 0 ? auth.user.notificationsEnabled : false,
        },
      });

      const presetCounts = new Map<string, { subjectCode: string; teacherCode: string; room: string; count: number }>();
      for (const entry of normalizedEntries) {
        const room = entry.room ?? '';
        const key = buildPresetKey(entry.subjectCode, entry.teacherCode, room);
        const existing = presetCounts.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          presetCounts.set(key, {
            subjectCode: entry.subjectCode,
            teacherCode: entry.teacherCode,
            room,
            count: 1,
          });
        }
      }

      const now = new Date();
      for (const preset of presetCounts.values()) {
        await tx.timetablePreset.upsert({
          where: {
            userId_subjectCode_teacherCode_room: {
              userId: auth.user.id,
              subjectCode: preset.subjectCode,
              teacherCode: preset.teacherCode,
              room: preset.room,
            },
          },
          create: {
            userId: auth.user.id,
            subjectCode: preset.subjectCode,
            teacherCode: preset.teacherCode,
            room: preset.room,
            usageCount: preset.count,
            lastUsedAt: now,
          },
          update: {
            usageCount: {
              increment: preset.count,
            },
            lastUsedAt: now,
          },
        });
      }
    });

    const [savedEntries, presets] = await Promise.all([
      prisma.timetableEntry.findMany({
        where: { userId: auth.user.id },
        include: {
          teacher: {
            select: { fullName: true },
          },
        },
        orderBy: [{ weekday: 'asc' }, { startPeriod: 'asc' }],
      }),
      prisma.timetablePreset.findMany({
        where: { userId: auth.user.id },
        orderBy: [{ usageCount: 'desc' }, { lastUsedAt: 'desc' }],
      }),
    ]);

    return NextResponse.json({
      entries: savedEntries.map(toTimetableEntryDto),
      presets: presets.map(toTimetablePresetDto),
    });
  } catch (error) {
    if (error instanceof TimetableValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Failed to save timetable', error);
    return NextResponse.json({ error: 'Stundenplan konnte nicht gespeichert werden.' }, { status: 500 });
  }
}
