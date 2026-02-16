import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { isAdminEmail, normalizeEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toAuthUserDto } from '@/lib/user-system-mappers';

const MIN_PASSWORD_LENGTH = 8;

const parseBcryptRounds = (): number => {
  const raw = process.env.BCRYPT_ROUNDS ?? '12';
  const value = parseInt(raw, 10);
  if (isNaN(value) || value < 10 || value > 14) {
    throw new Error(`BCRYPT_ROUNDS must be an integer between 10 and 14, received: ${raw}`);
  }
  return value;
};

const BCRYPT_ROUNDS = parseBcryptRounds();

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = normalizeEmail(body.email ?? '');
    const password = body.password ?? '';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.` },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'E-Mail ist bereits registriert.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const adminCount = await prisma.user.count({
      where: {
        role: 'ADMIN',
      },
    });
    const requiresAdminSetup = adminCount === 0;

    const createdUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: requiresAdminSetup || isAdminEmail(email) ? 'ADMIN' : 'USER',
      },
    });

    return NextResponse.json(
      {
        user: toAuthUserDto(createdUser),
        requiresAdminSetup,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration failed', error);
    return NextResponse.json({ error: 'Registrierung fehlgeschlagen.' }, { status: 500 });
  }
}
