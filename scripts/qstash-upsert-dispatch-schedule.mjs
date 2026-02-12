import { Client } from '@upstash/qstash';

const fail = (message) => {
  console.error(`[qstash] ${message}`);
  process.exit(1);
};

const qstashToken = process.env.QSTASH_TOKEN;
if (!qstashToken) {
  fail('QSTASH_TOKEN is missing.');
}

const appBaseUrl = process.env.APP_BASE_URL;
if (!appBaseUrl) {
  fail('APP_BASE_URL is missing (example: https://your-domain.tld).');
}

const cronSecret = process.env.PUSH_CRON_SECRET ?? process.env.CRON_SECRET;
if (!cronSecret) {
  fail('Set PUSH_CRON_SECRET or CRON_SECRET to secure the dispatch endpoint.');
}

const destination = `${appBaseUrl.replace(/\/$/, '')}/api/internal/push/dispatch`;
const cron = process.env.QSTASH_CRON ?? '*/15 * * * *';
const label = process.env.QSTASH_SCHEDULE_LABEL ?? 'fds-dispatch-v1';

const client = new Client({
  token: qstashToken,
  baseUrl: process.env.QSTASH_URL,
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
    },
    null,
    2
  )
);
