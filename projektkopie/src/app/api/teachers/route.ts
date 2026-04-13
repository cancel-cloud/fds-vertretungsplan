import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireUser();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  const teachers = await prisma.teacherDirectory.findMany({
    where: { isActive: true },
    select: {
      code: true,
      fullName: true,
    },
    orderBy: {
      code: 'asc',
    },
  });

  return NextResponse.json({
    teachers,
  });
}
