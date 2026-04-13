import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { enforceSameOrigin } from '@/lib/security/request-integrity';
import { normalizeCode } from '@/lib/timetable';
import { toTeacherDto } from '@/lib/user-system-mappers';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  const [teachers, subjectCodes] = await Promise.all([
    prisma.teacherDirectory.findMany({
      orderBy: [{ isActive: 'desc' }, { code: 'asc' }],
    }),
    prisma.timetableEntry.findMany({
      distinct: ['subjectCode'],
      select: {
        subjectCode: true,
      },
      orderBy: {
        subjectCode: 'asc',
      },
    }),
  ]);

  return NextResponse.json({
    teachers: teachers.map(toTeacherDto),
    subjectCodes: subjectCodes.map((entry) => entry.subjectCode),
  });
}

export async function POST(req: NextRequest) {
  const invalidOriginResponse = enforceSameOrigin(req);
  if (invalidOriginResponse) {
    return invalidOriginResponse;
  }

  const auth = await requireAdmin();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  try {
    const body = (await req.json()) as { code?: string; fullName?: string; isActive?: boolean };
    const code = normalizeCode(body.code ?? '');
    const fullName = String(body.fullName ?? '').trim();

    if (!code || !fullName) {
      return NextResponse.json({ error: 'Kürzel und voller Name sind erforderlich.' }, { status: 400 });
    }

    const teacher = await prisma.teacherDirectory.create({
      data: {
        code,
        fullName,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ teacher: toTeacherDto(teacher) }, { status: 201 });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ein Lehrer mit diesem Kürzel existiert bereits.' }, { status: 409 });
    }
    console.error('Failed to create teacher', error);
    return NextResponse.json({ error: 'Lehrer konnte nicht erstellt werden.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const invalidOriginResponse = enforceSameOrigin(req);
  if (invalidOriginResponse) {
    return invalidOriginResponse;
  }

  const auth = await requireAdmin();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  try {
    const body = (await req.json()) as {
      id?: string;
      code?: string;
      fullName?: string;
      isActive?: boolean;
    };

    const id = String(body.id ?? '').trim();
    if (!id) {
      return NextResponse.json({ error: 'Lehrer-ID fehlt.' }, { status: 400 });
    }

    const updates: {
      code?: string;
      fullName?: string;
      isActive?: boolean;
    } = {};

    if (typeof body.code === 'string') {
      const code = normalizeCode(body.code);
      if (!code) {
        return NextResponse.json({ error: 'Lehrer-Kürzel darf nicht leer sein.' }, { status: 400 });
      }
      updates.code = code;
    }

    if (typeof body.fullName === 'string') {
      const fullName = body.fullName.trim();
      if (!fullName) {
        return NextResponse.json({ error: 'Lehrername darf nicht leer sein.' }, { status: 400 });
      }
      updates.fullName = fullName;
    }

    if (typeof body.isActive === 'boolean') {
      updates.isActive = body.isActive;
    }

    const teacher = await prisma.teacherDirectory.update({
      where: { id },
      data: updates,
    });

    if (updates.code) {
      await prisma.timetableEntry.updateMany({
        where: {
          teacherId: id,
        },
        data: {
          teacherCode: updates.code,
        },
      });
    }

    return NextResponse.json({ teacher: toTeacherDto(teacher) });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ein Lehrer mit diesem Kürzel existiert bereits.' }, { status: 409 });
    }
    console.error('Failed to update teacher', error);
    return NextResponse.json({ error: 'Lehrer konnte nicht aktualisiert werden.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const invalidOriginResponse = enforceSameOrigin(req);
  if (invalidOriginResponse) {
    return invalidOriginResponse;
  }

  const auth = await requireAdmin();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  try {
    const body = (await req.json()) as { id?: string };
    const id = String(body.id ?? '').trim();

    if (!id) {
      return NextResponse.json({ error: 'Lehrer-ID fehlt.' }, { status: 400 });
    }

    await prisma.teacherDirectory.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete teacher', error);
    return NextResponse.json({ error: 'Lehrer konnte nicht gelöscht werden.' }, { status: 500 });
  }
}
