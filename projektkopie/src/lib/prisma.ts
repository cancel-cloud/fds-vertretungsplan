import { PrismaClient } from '@prisma/client';
import { resolveDemoAwareEnv } from '@/lib/demo-config';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const datasourceUrl = resolveDemoAwareEnv('DATABASE_URL', 'DEMO_DATABASE_URL');

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
