import { NextRequest, NextResponse } from 'next/server';
import { processApiResponse } from '@/lib/data-processing';
import { findRelevantSubstitutions, TimetableMatchEntry } from '@/lib/schedule-matching';
import { getPushAppName, isPushWindow, sendPushMessage } from '@/lib/push';
import { prisma } from '@/lib/prisma';
import {
  buildNotificationFingerprint,
  canonicalizeMatchKeys,
  clampNotificationLookaheadSchoolDays,
  getNextSchoolDays,
  resolveNotificationDeltaAction,
} from '@/lib/notification-state';
import { fetchUntisRows, toUntisDateNumber } from '@/lib/substitution-fetcher';
import { verifyQstashSignature } from '@/lib/qstash';

const TIMEZONE = process.env.APP_TIMEZONE ?? 'Europe/Berlin';

const getZonedDate = (source: Date): Date => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(source);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? '0');

  return new Date(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
};

const formatDateForQuery = (dateNumber: number): string => String(dateNumber);
const isIosEndpoint = (endpoint: string): boolean => endpoint.includes('web.push.apple.com');
type DeviceFilter = 'all' | 'ios' | 'desktop';

const parseDeviceFilter = (value: string | null): DeviceFilter => {
  if (value === 'ios' || value === 'desktop') {
    return value;
  }
  return 'all';
};

export async function POST(req: NextRequest) {
  return runDispatch(req);
}

export async function GET(req: NextRequest) {
  return runDispatch(req);
}

function hasValidBearerToken(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const expectedToken = process.env.PUSH_CRON_SECRET ?? process.env.CRON_SECRET;
  return Boolean(expectedToken && token === expectedToken);
}

async function runDispatch(req: NextRequest) {
  const appName = getPushAppName();
  const includePayload = process.env.PUSH_INCLUDE_PAYLOAD === 'true';
  const force = req.nextUrl.searchParams.get('force') === '1';
  const sendUnchanged = req.nextUrl.searchParams.get('sendUnchanged') === '1';
  const userEmailFilter = req.nextUrl.searchParams.get('userEmail')?.trim().toLowerCase() ?? '';
  const userIdFilter = req.nextUrl.searchParams.get('userId')?.trim() ?? '';
  const deviceFilter = parseDeviceFilter(req.nextUrl.searchParams.get('device'));
  const hasQstashSignature = Boolean(req.headers.get('upstash-signature'));

  if (hasQstashSignature) {
    const qstashValid = await verifyQstashSignature(req);
    if (!qstashValid) {
      const isDev = process.env.NODE_ENV !== 'production';
      if (!isDev || !hasValidBearerToken(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      console.warn('QStash signature mismatch accepted in development via Bearer fallback.');
    }
  } else {
    if (!hasValidBearerToken(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const now = getZonedDate(new Date());
  if (!force && !isPushWindow(now)) {
    return NextResponse.json({ ok: true, skipped: 'outside-window' });
  }

  const users = await prisma.user.findMany({
    where: {
      ...(userEmailFilter ? { email: userEmailFilter } : {}),
      ...(userIdFilter ? { id: userIdFilter } : {}),
      notificationsEnabled: true,
      timetableEntries: {
        some: {},
      },
      pushSubscriptions: {
        some: {},
      },
    },
    include: {
      timetableEntries: true,
      pushSubscriptions: true,
    },
  });

  if (users.length === 0) {
    return NextResponse.json({
      ok: true,
      forced: force,
      includePayload,
      users: 0,
      usersTouched: 0,
      notificationsSent: 0,
    });
  }

  const fetchDates = new Map<number, Date>();
  for (const user of users) {
    const targetDates = getNextSchoolDays(now, clampNotificationLookaheadSchoolDays(user.notificationLookaheadSchoolDays));
    for (const date of targetDates) {
      fetchDates.set(toUntisDateNumber(date), date);
    }
  }

  let substitutionsByDate = new Map<number, ReturnType<typeof processApiResponse>>();
  try {
    const dateEntries = [...fetchDates.entries()];
    const fetched = await Promise.all(
      dateEntries.map(async ([dateNumber, date]) => {
        const raw = await fetchUntisRows(date);
        return {
          dateNumber,
          substitutions: processApiResponse(raw.rows),
        };
      })
    );
    substitutionsByDate = new Map(fetched.map((item) => [item.dateNumber, item.substitutions]));
  } catch (error) {
    console.error('Push dispatch skipped because substitution data could not be loaded.', error);
    return NextResponse.json(
      {
        ok: false,
        forced: force,
        includePayload,
        error: 'upstream-unavailable',
      },
      { status: 503 }
    );
  }

  let notificationsSent = 0;
  let usersTouched = 0;
  let skippedUnchanged = 0;
  let skippedNoEligibleDevice = 0;

  for (const user of users) {
    const entries: TimetableMatchEntry[] = user.timetableEntries.map((entry) => ({
      id: entry.id,
      weekday: entry.weekday,
      startPeriod: entry.startPeriod,
      duration: entry.duration as 1 | 2,
      subjectCode: entry.subjectCode,
      teacherCode: entry.teacherCode,
      room: entry.room,
      weekMode: entry.weekMode,
    }));

    const lookaheadDays = getNextSchoolDays(now, clampNotificationLookaheadSchoolDays(user.notificationLookaheadSchoolDays));
    const targetDateNumbers = lookaheadDays.map((date) => toUntisDateNumber(date));
    const notificationStates = await prisma.notificationState.findMany({
      where: {
        userId: user.id,
        targetDate: { in: targetDateNumbers },
      },
    });
    const stateByDate = new Map(notificationStates.map((state) => [state.targetDate, state]));
    let userWasTouched = false;

    for (const dayDate of lookaheadDays) {
      const dateNumber = toUntisDateNumber(dayDate);
      const substitutions = substitutionsByDate.get(dateNumber) ?? [];
      const matches = findRelevantSubstitutions(substitutions, entries, dayDate);
      const keys = canonicalizeMatchKeys(matches);
      const currentMatchCount = keys.length;
      const currentFingerprint =
        currentMatchCount > 0 ? buildNotificationFingerprint(user.id, dateNumber, keys) : null;
      const previousState = stateByDate.get(dateNumber) ?? null;

      const action = resolveNotificationDeltaAction(
        previousState?.lastFingerprint ?? null,
        currentFingerprint,
        currentMatchCount
      );

      if (action === 'clear') {
        await prisma.notificationState.deleteMany({
          where: {
            userId: user.id,
            targetDate: dateNumber,
          },
        });
        continue;
      }

      if (action === 'skip') {
        if (!sendUnchanged || currentMatchCount <= 0) {
          skippedUnchanged += 1;
          continue;
        }
      }

      let sentForThisFingerprint = 0;
      const staleEndpoints: string[] = [];
      const eligibleSubscriptions = user.pushSubscriptions.filter((subscription) => {
        if (deviceFilter === 'all') {
          return true;
        }

        const ios = isIosEndpoint(subscription.endpoint);
        return deviceFilter === 'ios' ? ios : !ios;
      });

      if (eligibleSubscriptions.length === 0) {
        skippedNoEligibleDevice += 1;
        continue;
      }

      const titleDate = dayDate.toLocaleDateString('de-DE', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      });

      for (const subscription of eligibleSubscriptions) {
        const payload = includePayload
          ? {
              title: `${appName} · ${titleDate}`,
              body: `${currentMatchCount} Änderung(en) betreffen deinen Stundenplan.`,
              url: `/stundenplan/dashboard?date=${formatDateForQuery(dateNumber)}`,
              tag: `fds-sub-${dateNumber}-${currentFingerprint?.slice(0, 8) ?? '00000000'}`,
            }
          : null;

        const result = await sendPushMessage(
          {
            endpoint: subscription.endpoint,
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
          payload
        );

        if (result.ok) {
          sentForThisFingerprint += 1;
        } else if (result.remove) {
          staleEndpoints.push(subscription.endpoint);
        }
      }

      if (staleEndpoints.length > 0) {
        await prisma.pushSubscription.deleteMany({
          where: {
            endpoint: {
              in: staleEndpoints,
            },
            userId: user.id,
          },
        });
      }

      if (sentForThisFingerprint > 0) {
        notificationsSent += sentForThisFingerprint;
        if (!userWasTouched) {
          usersTouched += 1;
          userWasTouched = true;
        }

        await prisma.notificationState.upsert({
          where: {
            userId_targetDate: {
              userId: user.id,
              targetDate: dateNumber,
            },
          },
          update: {
            lastFingerprint: currentFingerprint!,
            lastMatchCount: currentMatchCount,
            lastSentAt: new Date(),
          },
          create: {
            userId: user.id,
            targetDate: dateNumber,
            lastFingerprint: currentFingerprint!,
            lastMatchCount: currentMatchCount,
            lastSentAt: new Date(),
          },
        });

        await prisma.notificationFingerprint.createMany({
          data: [
            {
              userId: user.id,
              targetDate: dateNumber,
              fingerprint: currentFingerprint!,
            },
          ],
          skipDuplicates: true,
        });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    forced: force,
    sendUnchanged,
    filters: {
      userEmail: userEmailFilter || null,
      userId: userIdFilter || null,
      device: deviceFilter,
    },
    includePayload,
    users: users.length,
    usersTouched,
    notificationsSent,
    skippedUnchanged,
    skippedNoEligibleDevice,
  });
}
