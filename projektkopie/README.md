# FDS Vertretungsplan V3

Bereinigte Projektkopie der Webanwendung fuer den Vertretungsplan der Friedrich-Dessauer-Schule Limburg.

Diese Kopie enthaelt nur den relevanten Anwendungscode, Tests und die noetige Betriebsdokumentation:

- Demo-Anleitung: `docs/DEMO_RUNBOOK.md`
- Live-Betrieb: `docs/LIVE_BETRIEB.md`

## Tech-Stack

- Next.js 16
- React 19
- TypeScript 5
- Prisma mit PostgreSQL
- NextAuth (Credentials)
- Web Push mit VAPID
- Upstash QStash

## Projektstruktur

- `src/`: App Router, API-Routen, Komponenten, Hooks, Utilities, Tests
- `public/`: statische Assets und Service Worker
- `prisma/`: Prisma-Schema
- `scripts/`: Prisma-, QStash- und Demo-Scheduler-Skripte
- `docs/`: bereinigte Betriebsdokumentation

## Lokal starten

### 1. Abhaengigkeiten installieren

```bash
npm install
```

### 2. `.env.local` anlegen

Minimal fuer normalen Betrieb:

```env
# Auth
AUTH_SECRET=replace-with-a-long-random-secret
ADMIN_EMAILS=bootstrap-admin@example.com

# Datenbank
DATABASE_URL=postgresql://fds:fds-password@localhost:5432/fds?schema=public

# Push
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@example.com
PUSH_APP_NAME=FDS Stundenplan

# Scheduler / Webhook
PUSH_CRON_SECRET=replace-with-a-long-random-secret
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
APP_BASE_URL=http://localhost:3000

# Optional
APP_TIMEZONE=Europe/Berlin
BCRYPT_ROUNDS=12
QSTASH_URL=https://qstash.upstash.io
QSTASH_CRON=*/15 * * * *
QSTASH_SCHEDULE_LABEL=fds-dispatch-v1
QSTASH_EXPECTED_URL=

# Optional Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
POSTHOG_API_KEY=
POSTHOG_HOST=https://eu.i.posthog.com
```

Hinweise:

- `UNTIS_SCHOOL` ist optional. Standard ist `friedrich-dessauer-schule-limburg`.
- `UNTIS_BASE_URL` ist optional. Standard ist `https://<UNTIS_SCHOOL>.webuntis.com`.
- Falls `UNTIS_BASE_URL` gesetzt wird, muss die URL `https://*.webuntis.com` verwenden.
- Der erste Account darf nur mit der ersten E-Mail aus `ADMIN_EMAILS` angelegt werden.

### 3. Prisma initialisieren

```bash
npm run prisma:generate
npm run prisma:push
```

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Danach:

- `http://localhost:3000/`
- `http://localhost:3000/stundenplan`

## Demo-Modus

Der Demo-Modus wird nur durch `APP_MODE=demo` aktiviert.

```env
APP_MODE=demo
DEMO_DATABASE_URL=postgresql://...
DEMO_APP_BASE_URL=http://localhost:3000
DEMO_PUSH_CRON_SECRET=replace-with-demo-secret
DEMO_QSTASH_URL=http://127.0.0.1:8080
DEMO_QSTASH_TOKEN=
DEMO_QSTASH_CURRENT_SIGNING_KEY=
DEMO_QSTASH_NEXT_SIGNING_KEY=
DEMO_QSTASH_SCHEDULE_LABEL=fds-dispatch-demo-v1
DEMO_QSTASH_CRON=* * * * *
```

Wichtig:

- `DEMO_*` werden nur von den demo-aware Teilen genutzt: Prisma, QStash und Dispatch.
- `AUTH_SECRET` bleibt auch im Demo-Modus eine Basis-Variable.
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` und `VAPID_SUBJECT` bleiben ebenfalls Basis-Variablen.
- Details zum Demo-Ablauf stehen in `docs/DEMO_RUNBOOK.md`.

## Wichtige Befehle

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test:run
npm run prisma:generate
npm run prisma:push
npm run qstash:schedule
npm run demo:scheduler:start
npm run demo:scheduler:stop
```

## Build-Hinweis

`npm run build` fuehrt vor dem eigentlichen Build `prisma generate` direkt ueber `prebuild` aus. Dafuer muss beim Build eine gueltige `DATABASE_URL` fuer Prisma sichtbar sein. Diese `prebuild`-Ausfuehrung nutzt nicht automatisch dieselbe Demo-Umschaltung wie `npm run prisma:generate`.

## QStash und Push

- Standard im Live-Betrieb: `QSTASH_CRON=*/15 * * * *`
- Standard im Demo-Modus: `DEMO_QSTASH_CRON=* * * * *`
- Die Dispatch-Route ist `POST /api/internal/push/dispatch`
- Pushes werden standardmaessig nur montags bis freitags zwischen `06:00` und `20:00` versendet
- `QSTASH_EXPECTED_URL` ist nur fuer Sonderfaelle gedacht, zum Beispiel bei Proxy- oder Host-Mismatch bei der Signaturpruefung

## Verifikation

```bash
npm run lint
npm run test:run
```

Fuer den Live-Betrieb siehe `docs/LIVE_BETRIEB.md`.
