import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getBootstrapAdminEmail, isAdminEmail, normalizeEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enforceSameOrigin } from '@/lib/security/request-integrity';
import { consumeRateLimit, resolveClientIp } from '@/lib/security/rate-limit';
import { toAuthUserDto } from '@/lib/user-system-mappers';

const MIN_PASSWORD_LENGTH = 8;
const REGISTER_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const REGISTER_RATE_LIMIT_PER_IP = 10;
const REGISTER_RATE_LIMIT_PER_EMAIL = 5;

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
  const invalidOriginResponse = enforceSameOrigin(req);
  if (invalidOriginResponse) {
    return invalidOriginResponse;
  }

  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = normalizeEmail(body.email ?? '');
    const password = body.password ?? '';
    const clientIp = resolveClientIp(req.headers);

    const ipLimit = consumeRateLimit({
      key: `register:ip:${clientIp}`,
      limit: REGISTER_RATE_LIMIT_PER_IP,
      windowMs: REGISTER_RATE_LIMIT_WINDOW_MS,
    });
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Zu viele Registrierungsversuche. Bitte später erneut versuchen.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(ipLimit.retryAfterSeconds),
          },
        }
      );
    }

    if (email) {
      const emailLimit = consumeRateLimit({
        key: `register:email:${email}`,
        limit: REGISTER_RATE_LIMIT_PER_EMAIL,
        windowMs: REGISTER_RATE_LIMIT_WINDOW_MS,
      });
      if (!emailLimit.allowed) {
        return NextResponse.json(
          { error: 'Zu viele Registrierungsversuche. Bitte später erneut versuchen.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(emailLimit.retryAfterSeconds),
            },
          }
        );
      }
    }

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
    const bootstrapAdminEmail = getBootstrapAdminEmail();

    if (requiresAdminSetup && !bootstrapAdminEmail) {
      return NextResponse.json(
        { error: 'Erstregistrierung ist noch nicht konfiguriert. Setze ADMIN_EMAILS in der Umgebung.' },
        { status: 503 }
      );
    }

    if (requiresAdminSetup && email !== bootstrapAdminEmail) {
      return NextResponse.json(
        { error: 'Nur die konfigurierte Bootstrap-Admin-E-Mail darf den ersten Account erstellen.' },
        { status: 403 }
      );
    }

    const createdUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: (requiresAdminSetup && email === bootstrapAdminEmail) || isAdminEmail(email) ? 'ADMIN' : 'USER',
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
