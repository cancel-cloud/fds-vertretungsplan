import type { NextRequest } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { resolveDemoAwareEnv } from '@/lib/demo-config';

const getReceiver = (): Receiver | null => {
  const currentSigningKey = resolveDemoAwareEnv('QSTASH_CURRENT_SIGNING_KEY', 'DEMO_QSTASH_CURRENT_SIGNING_KEY');
  const nextSigningKey = resolveDemoAwareEnv('QSTASH_NEXT_SIGNING_KEY', 'DEMO_QSTASH_NEXT_SIGNING_KEY');

  if (!currentSigningKey || !nextSigningKey) {
    return null;
  }

  return new Receiver({ currentSigningKey, nextSigningKey });
};

export const hasQstashSigningKeys = (): boolean =>
  Boolean(
    resolveDemoAwareEnv('QSTASH_CURRENT_SIGNING_KEY', 'DEMO_QSTASH_CURRENT_SIGNING_KEY') &&
      resolveDemoAwareEnv('QSTASH_NEXT_SIGNING_KEY', 'DEMO_QSTASH_NEXT_SIGNING_KEY')
  );

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');

const buildCandidateUrls = (req: NextRequest): string[] => {
  const candidates = new Set<string>();
  const pathAndQuery = `${req.nextUrl.pathname}${req.nextUrl.search}`;

  if (req.url) {
    candidates.add(req.url);
  }

  const appBaseUrl = resolveDemoAwareEnv('APP_BASE_URL', 'DEMO_APP_BASE_URL');
  if (appBaseUrl) {
    candidates.add(`${normalizeBaseUrl(appBaseUrl)}${pathAndQuery}`);
  }

  const explicitExpectedUrl = resolveDemoAwareEnv('QSTASH_EXPECTED_URL', 'DEMO_QSTASH_EXPECTED_URL');
  if (explicitExpectedUrl) {
    candidates.add(explicitExpectedUrl);
  }

  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ?? 'https';
  if (forwardedHost) {
    candidates.add(`${forwardedProto}://${forwardedHost}${pathAndQuery}`);
  }

  const host = req.headers.get('host')?.trim();
  if (host) {
    candidates.add(`${forwardedProto}://${host}${pathAndQuery}`);
  }

  return [...candidates];
};

export async function verifyQstashSignature(req: NextRequest): Promise<boolean> {
  const signature = req.headers.get('upstash-signature');
  if (!signature) {
    return false;
  }

  const receiver = getReceiver();
  if (!receiver) {
    return false;
  }

  const body = await req.clone().text();
  const candidates = buildCandidateUrls(req);

  for (const candidateUrl of candidates) {
    try {
      const verified = await receiver.verify({
        signature,
        body,
        url: candidateUrl,
      });
      if (verified) {
        return true;
      }
    } catch {
      // Try next candidate URL.
    }
  }

  console.warn('Invalid QStash signature', {
    requestUrl: req.url,
    candidates,
  });
  return false;
}
