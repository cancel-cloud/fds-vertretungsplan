import { Client } from '@upstash/qstash';

const fail = (message) => {
  console.error(`[demo-scheduler] ${message}`);
  process.exit(1);
};

const resolveValue = (baseKey, demoKey, fallback) => {
  const demoValue = process.env[demoKey]?.trim();
  if (demoValue) {
    return demoValue;
  }

  const baseValue = process.env[baseKey]?.trim();
  if (baseValue) {
    return baseValue;
  }

  return fallback;
};

const command = process.argv[2];
if (command !== 'start' && command !== 'stop') {
  fail('Usage: node --env-file=.env.local scripts/demo-scheduler.mjs <start|stop>');
}

const qstashToken = resolveValue('QSTASH_TOKEN', 'DEMO_QSTASH_TOKEN');
if (!qstashToken) {
  fail('Missing DEMO_QSTASH_TOKEN (or QSTASH_TOKEN fallback).');
}

const qstashUrl = resolveValue('QSTASH_URL', 'DEMO_QSTASH_URL');
const appBaseUrl = resolveValue('APP_BASE_URL', 'DEMO_APP_BASE_URL');
if (!appBaseUrl) {
  fail('Missing DEMO_APP_BASE_URL (or APP_BASE_URL fallback).');
}

const cronSecret =
  resolveValue('PUSH_CRON_SECRET', 'DEMO_PUSH_CRON_SECRET') ?? resolveValue('CRON_SECRET', 'DEMO_CRON_SECRET');
if (!cronSecret) {
  fail('Missing DEMO_PUSH_CRON_SECRET (or PUSH_CRON_SECRET fallback).');
}

const label = resolveValue('QSTASH_SCHEDULE_LABEL', 'DEMO_QSTASH_SCHEDULE_LABEL', 'fds-dispatch-demo-v1');
const cron = resolveValue('QSTASH_CRON', 'DEMO_QSTASH_CRON', '* * * * *');
const destination = `${appBaseUrl.replace(/\/$/, '')}/api/internal/push/dispatch?force=1&sendUnchanged=1`;

const client = new Client({
  token: qstashToken,
  ...(qstashUrl ? { baseUrl: qstashUrl } : {}),
});

const schedules = await client.schedules.list();
const existing = schedules.find((schedule) => schedule.label === label);

if (command === 'stop') {
  if (!existing) {
    console.log(JSON.stringify({ ok: true, action: 'noop', reason: 'schedule-not-found', label }, null, 2));
    process.exit(0);
  }

  await client.schedules.delete(existing.scheduleId);
  console.log(JSON.stringify({ ok: true, action: 'deleted', label, scheduleId: existing.scheduleId }, null, 2));
  process.exit(0);
}

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

const kickoff = await client.publishJSON({
  url: destination,
  method: 'POST',
  delay: 10,
  headers: {
    Authorization: `Bearer ${cronSecret}`,
  },
  body: {
    source: 'demo-scheduler-start',
  },
});

console.log(
  JSON.stringify(
    {
      ok: true,
      action: existing ? 'updated' : 'created',
      scheduleId: result.scheduleId,
      label,
      cron,
      destination,
      kickoffMessageId: kickoff.messageId,
      kickoffDelaySeconds: 10,
    },
    null,
    2
  )
);
