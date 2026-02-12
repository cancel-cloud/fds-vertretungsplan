import type { NextRequest } from 'next/server';
import { Receiver } from '@upstash/qstash';

const getReceiver = (): Receiver | null => {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

  if (!currentSigningKey || !nextSigningKey) {
    return null;
  }

  return new Receiver({ currentSigningKey, nextSigningKey });
};

export const hasQstashSigningKeys = (): boolean =>
  Boolean(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY);

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');

const buildCandidateUrls = (req: NextRequest): string[] => {
  const candidates = new Set<string>();
  const pathAndQuery = `${req.nextUrl.pathname}${req.nextUrl.search}`;

  if (req.url) {
    candidates.add(req.url);
  }

  const appBaseUrl = process.env.APP_BASE_URL?.trim();
  if (appBaseUrl) {
    candidates.add(`${normalizeBaseUrl(appBaseUrl)}${pathAndQuery}`);
  }

  const explicitExpectedUrl = process.env.QSTASH_EXPECTED_URL?.trim();
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
