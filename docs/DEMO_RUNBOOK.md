# Demo Mode V2 Runbook

## Purpose

This document describes:
1. How to set up and run Demo Mode locally.
2. What Demo Mode can do.
3. The exact rollout path from untested local state to merge into `main`.

Demo Mode is activated with `APP_MODE=demo` and is designed to be safe for production code merge, because demo behavior is gated by environment variables.

---

## What Demo Mode Does

When `APP_MODE=demo` is enabled:

1. Substitution data no longer comes from live WebUntis.
2. Data is served from a generated, fixed demo dataset stored in `AppSettings.demoDataset`.
3. Date selection is locked to:
   - Start: `2026-02-09`
   - Anchor/Today: `2026-02-16`
   - End: `2026-02-23`
4. In Admin (`/stundenplan/admin`), each user row gets `Demo-Daten generieren`.
   - This generates and activates one global demo dataset based on that user’s timetable.
5. Generation guarantees for the selected user:
   - Exactly 1 relevant match on `2026-02-16`.
   - At least 1 relevant match in the past (inside window).
   - At least 1 relevant match in near future (`+1..+3` days from anchor).
6. Registration remains possible in demo mode for first-user + onboarding flow.
7. Demo scheduler commands are available:
   - `npm run demo:scheduler:start`
   - `npm run demo:scheduler:stop`
8. Scheduler behavior:
   - Interval: every 60 seconds.
   - Immediate kickoff message: after ~10 seconds.
   - Uses summary dispatch (`force=1&sendUnchanged=1`).

---

## Required Environment Variables (Demo)

Add these to `.env.local`:

```env
APP_MODE=demo

# Demo DB
DEMO_DATABASE_URL=postgresql://REPLACE_ME

# Demo Dispatch
DEMO_APP_BASE_URL=http://localhost:3000
DEMO_PUSH_CRON_SECRET=REPLACE_ME

# Demo QStash (local dev mode recommended)
DEMO_QSTASH_URL=http://127.0.0.1:8080
DEMO_QSTASH_TOKEN=REPLACE_ME
DEMO_QSTASH_CURRENT_SIGNING_KEY=REPLACE_ME
DEMO_QSTASH_NEXT_SIGNING_KEY=REPLACE_ME
DEMO_QSTASH_SCHEDULE_LABEL=fds-dispatch-demo-v1
DEMO_QSTASH_CRON=* * * * *
```

Optional fallback keys (`QSTASH_*`, `PUSH_CRON_SECRET`, `APP_BASE_URL`) still work, but `DEMO_*` is recommended for clean separation.

---

## Command Pack (Copy/Paste)

Run these commands from repository root:

```bash
cd /Users/cancelcloud/Developer/personal/fds-vertretungsplan
```

Generate secrets:
<br> Auth secret can be ignored if you're okay to use the same as production.
```bash
echo "AUTH_SECRET=$(openssl rand -hex 32)"
echo "DEMO_PUSH_CRON_SECRET=$(openssl rand -hex 32)"
```

Start local QStash once and copy the printed `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`:

```bash
npx --yes @upstash/qstash-cli dev
```

Then put all values in `.env.local`:

```env
APP_MODE=demo

AUTH_SECRET=PASTE_FROM_OPENSSL
DEMO_PUSH_CRON_SECRET=PASTE_FROM_OPENSSL

DEMO_DATABASE_URL=postgresql://REPLACE_ME
DEMO_APP_BASE_URL=http://localhost:3000

DEMO_QSTASH_URL=http://127.0.0.1:8080
DEMO_QSTASH_TOKEN=PASTE_FROM_QSTASH_DEV
DEMO_QSTASH_CURRENT_SIGNING_KEY=PASTE_FROM_QSTASH_DEV
DEMO_QSTASH_NEXT_SIGNING_KEY=PASTE_FROM_QSTASH_DEV
DEMO_QSTASH_SCHEDULE_LABEL=fds-dispatch-demo-v1
DEMO_QSTASH_CRON=* * * * *
```

---

## Local Setup (First Time)

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client and apply schema changes to demo DB:

```bash
npm run prisma:generate
npm run prisma:push
```

In `APP_MODE=demo`, these commands automatically use `DEMO_DATABASE_URL`.

3. Start app:

```bash
npm run dev
```

4. (Optional push demo) Start local QStash:

```bash
npx --yes @upstash/qstash-cli dev
```

---

## Demo Scenario Flow

1. Register first user:
   - `http://localhost:3000/stundenplan/register`
2. Enter timetable:
   - `http://localhost:3000/stundenplan/stundenplan`
3. Generate demo data:
   - `http://localhost:3000/stundenplan/admin`
   - In users table, click `Demo-Daten generieren` for target user.
4. Validate dashboard:
   - `http://localhost:3000/stundenplan/dashboard`
   - Confirm date lock and relevant matches.
5. Validate public view:
   - `http://localhost:3000/`
   - Confirm same date lock and deterministic data.
6. Validate push demo (optional):

```bash
npm run demo:scheduler:start
```

Then stop after showcase:

```bash
npm run demo:scheduler:stop
```

---

## Recommended Path From Here (Untested -> Main)

### Phase 1: Stabilize Locally

1. Ensure demo env is configured (`APP_MODE=demo`, `DEMO_DATABASE_URL`, secrets).
2. Run:

```bash
npm run prisma:push
npm run lint
npm run test:run
```

3. Execute the full demo scenario flow above manually once.

### Phase 2: Branch + Commit

1. Create a feature branch:

```bash
git switch -c codex/demo-mode-v2
```

2. Commit changes:

```bash
git add .
git commit -m "feat(demo): add user-driven demo mode with admin dataset generation"
```

### Phase 3: PR Validation

1. Push branch:

```bash
git push -u origin codex/demo-mode-v2
```

2. Open PR to `main`.
3. In PR checks or local CI command set, run:
   - `npm run lint`
   - `npm run test:run`
   - `npm run build`
4. Validate a preview environment with `APP_MODE=demo`.

### Phase 4: Merge + Production Safety

1. Merge PR to `main` after checks pass.
2. In production/stable environment:
   - Do **not** set `APP_MODE=demo`.
   - Do not set `DEMO_*` values unless intentionally testing demo there.
3. Apply DB schema migration/push before deployment if not already applied.

This keeps one repository containing both production and demo capabilities, with runtime separation via env.

---

## Quick Troubleshooting

1. `Demo-Daten generieren` returns timetable error:
   - User has no timetable; add entries first.
2. Dashboard shows demo meta message:
   - No demo dataset generated yet; generate from admin page.
3. Push dispatch unauthorized:
   - Verify `DEMO_PUSH_CRON_SECRET` matches scheduler headers.
4. QStash local issues:
   - Ensure `DEMO_QSTASH_URL=http://127.0.0.1:8080` and local dev server is running.
5. Prisma error `P1012 Environment variable not found: DATABASE_URL`:
   - Use `npm run prisma:generate` / `npm run prisma:push` (not raw `prisma ...`).
   - Ensure `.env.local` contains `APP_MODE=demo` and `DEMO_DATABASE_URL=...`.
