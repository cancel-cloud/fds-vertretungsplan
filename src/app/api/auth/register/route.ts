import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { isAdminEmail, normalizeEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { toAuthUserDto } from '@/lib/user-system-mappers';

const MIN_PASSWORD_LENGTH = 8;
const DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

const parseBcryptRounds = (): number => {
  const raw = process.env.BCRYPT_ROUNDS ?? '12';
  const value = parseInt(raw, 10);
  if (isNaN(value) || value < 10 || value > 14) {
    throw new Error(`BCRYPT_ROUNDS must be an integer between 10 and 14, received: ${raw}`);
  }
  return value;
};

const BCRYPT_ROUNDS = parseBcryptRounds();

const normalizeDomain = (value: string): string => value.trim().toLowerCase().replace(/^@/, '');

const parseAllowedDomains = (input: unknown): string[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  const uniqueDomains = new Set<string>();

  for (const item of input) {
    if (typeof item !== 'string') {
      continue;
    }

    const domain = normalizeDomain(item);
    if (!domain) {
      continue;
    }

    if (!DOMAIN_PATTERN.test(domain)) {
      throw new Error(`Ungültige Domain: ${domain}`);
    }

    uniqueDomains.add(domain);
  }

  return [...uniqueDomains];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string; allowedDomains?: unknown };
    const email = normalizeEmail(body.email ?? '');
    const password = body.password ?? '';
    const requestedAllowedDomains = parseAllowedDomains(body.allowedDomains);

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

    const emailDomain = email.split('@')[1]?.toLowerCase() ?? '';

    const settings = await prisma.appSettings.findUnique({
      where: { id: 1 },
      select: { allowedEmailDomains: true },
    });

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const adminCount = await prisma.user.count({
      where: {
        role: 'ADMIN',
      },
    });
    const requiresAdminSetup = adminCount === 0;

    if (requiresAdminSetup && requestedAllowedDomains.length === 0) {
      return NextResponse.json(
        {
          error: 'Bei der ersten Admin-Registrierung müssen erlaubte E-Mail-Domains gesetzt werden.',
        },
        { status: 400 }
      );
    }

    if (!requiresAdminSetup) {
      const allowedDomains = settings?.allowedEmailDomains ?? [];
      if (allowedDomains.length > 0 && !allowedDomains.includes(emailDomain)) {
        return NextResponse.json(
          {
            error: 'Registrierung nur mit erlaubter Schul-Domain möglich.',
          },
          { status: 403 }
        );
      }
    }

    const createdUser = await prisma.$transaction(async (tx) => {
      if (requiresAdminSetup) {
        const mergedDomains = [...new Set([...requestedAllowedDomains, emailDomain])].filter(Boolean);
        await tx.appSettings.upsert({
          where: { id: 1 },
          create: {
            id: 1,
            allowedEmailDomains: mergedDomains,
          },
          update: {
            allowedEmailDomains: mergedDomains,
          },
        });
      }

      return tx.user.create({
        data: {
          email,
          passwordHash,
          role: requiresAdminSetup || isAdminEmail(email) ? 'ADMIN' : 'USER',
        },
      });
    });

    return NextResponse.json(
      {
        user: toAuthUserDto(createdUser),
        requiresAdminSetup,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Ungültige Domain:')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Registration failed', error);
    return NextResponse.json({ error: 'Registrierung fehlgeschlagen.' }, { status: 500 });
  }
}
