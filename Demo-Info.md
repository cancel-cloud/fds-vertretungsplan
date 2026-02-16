# Demo Mode Info

Vollständiger Runbook (Setup + Testablauf + Merge-Rundown): `docs/DEMO_RUNBOOK.md`

## 1) Demo mode aktivieren

In `.env.local`:

```env
APP_MODE=demo

# Demo Datenbank
DEMO_DATABASE_URL=postgresql://...

# Demo QStash (lokal)
DEMO_QSTASH_URL=http://127.0.0.1:8080
DEMO_QSTASH_TOKEN=dev-token
DEMO_QSTASH_CURRENT_SIGNING_KEY=dev-current-signing-key
DEMO_QSTASH_NEXT_SIGNING_KEY=dev-next-signing-key
DEMO_QSTASH_SCHEDULE_LABEL=fds-dispatch-demo-v1
DEMO_QSTASH_CRON=* * * * *

# Demo Dispatch
DEMO_APP_BASE_URL=http://localhost:3000
DEMO_PUSH_CRON_SECRET=replace-with-demo-secret
```

## 2) QStash lokal starten

```bash
npx --yes @upstash/qstash-cli dev
```

Default-Port ist `8080`.

## 3) App starten

```bash
npm run dev
```

Prisma-Kommandos immer ueber npm-Skripte ausfuehren:

```bash
npm run prisma:generate
npm run prisma:push
```

Im Demo-Mode (`APP_MODE=demo`) verwenden diese Skripte automatisch `DEMO_DATABASE_URL`.

## 4) First-user Flow im Demo Mode

1. Registriere den ersten User normal unter `/stundenplan/register`.
2. Hinterlege den Stundenplan unter `/stundenplan/stundenplan`.
3. Öffne `/stundenplan/admin`.
4. In der User-Tabelle: Button `Demo-Daten generieren` beim Ziel-User klicken.

Danach ist der globale Demo-Datensatz aktiv.

## 5) Demo-Datumsfenster

- Fixes Fenster: `2026-02-09` bis `2026-02-23`
- Anchor/Today: `2026-02-16`
- Außerhalb dieses Fensters sind Kalenderdaten nicht klickbar.

## 6) Scheduler starten/stoppen (Showcase)

Startet 60s-Schedule (`force=1&sendUnchanged=1`) und triggert einen ersten Dispatch nach ca. 10 Sekunden:

```bash
npm run demo:scheduler:start
```

Stoppt den Demo-Schedule:

```bash
npm run demo:scheduler:stop
```

Hinweis: QStash Schedules unterstützen minimal 60s-Intervalle.
