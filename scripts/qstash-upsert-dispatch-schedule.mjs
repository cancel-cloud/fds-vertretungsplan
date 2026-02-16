import { Client } from '@upstash/qstash';

const fail = (message) => {
  console.error(`[qstash] ${message}`);
  process.exit(1);
};

const isDemoMode = String(process.env.APP_MODE ?? '').trim().toLowerCase() === 'demo';

const resolveValue = (baseKey, demoKey, fallback) => {
  if (isDemoMode) {
    const demoValue = process.env[demoKey]?.trim();
    if (demoValue) {
      return demoValue;
    }
  }

  const baseValue = process.env[baseKey]?.trim();
  if (baseValue) {
    return baseValue;
  }

  return fallback;
};

const qstashToken = resolveValue('QSTASH_TOKEN', 'DEMO_QSTASH_TOKEN');
if (!qstashToken) {
  fail('QSTASH_TOKEN (or DEMO_QSTASH_TOKEN in demo mode) is missing.');
}

const appBaseUrl = resolveValue('APP_BASE_URL', 'DEMO_APP_BASE_URL');
if (!appBaseUrl) {
  fail('APP_BASE_URL (or DEMO_APP_BASE_URL in demo mode) is missing.');
}

const cronSecret =
  resolveValue('PUSH_CRON_SECRET', 'DEMO_PUSH_CRON_SECRET') ?? resolveValue('CRON_SECRET', 'DEMO_CRON_SECRET');
if (!cronSecret) {
  fail('Set PUSH_CRON_SECRET/CRON_SECRET (or DEMO_* variants in demo mode).');
}

const cron = resolveValue('QSTASH_CRON', 'DEMO_QSTASH_CRON', isDemoMode ? '* * * * *' : '*/15 * * * *');
const label = resolveValue(
  'QSTASH_SCHEDULE_LABEL',
  'DEMO_QSTASH_SCHEDULE_LABEL',
  isDemoMode ? 'fds-dispatch-demo-v1' : 'fds-dispatch-v1'
);
const qstashUrl = resolveValue('QSTASH_URL', 'DEMO_QSTASH_URL');
const dispatchPath = resolveValue('QSTASH_DISPATCH_PATH', 'DEMO_QSTASH_DISPATCH_PATH', '/api/internal/push/dispatch');
const destination = `${appBaseUrl.replace(/\/$/, '')}${dispatchPath.startsWith('/') ? dispatchPath : `/${dispatchPath}`}`;

const client = new Client({
  token: qstashToken,
  ...(qstashUrl ? { baseUrl: qstashUrl } : {}),
});

const schedules = await client.schedules.list();
const existing = schedules.find((schedule) => schedule.label === label);

const result = await client.schedules.create({
  scheduleId: existing?.scheduleId,
  destination,
  cron,
  method: 'POST',
  retries: 2,
  headers: {
    Authorization: `Bearer ${cronSecret}`,
  },
  label,
});

console.log(
  JSON.stringify(
    {
      ok: true,
      action: existing ? 'updated' : 'created',
      scheduleId: result.scheduleId,
      destination,
      cron,
      label,
      mode: isDemoMode ? 'demo' : 'default',
    },
    null,
    2
  )
);
