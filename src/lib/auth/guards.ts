import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser() {
  const session = await getServerAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 }),
    };
  }

  return { user, response: null };
}

export async function requireAdmin() {
  const result = await requireUser();

  if (result.response || !result.user) {
    return result;
  }

  if (result.user.role !== 'ADMIN') {
    return {
      user: null,
      response: NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 }),
    };
  }

  return { user: result.user, response: null };
}
