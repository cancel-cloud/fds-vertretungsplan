# Demo Runbook

Dieses Dokument beschreibt den bereinigten Demo-Betrieb der Anwendung.

## Zweck

Der Demo-Modus dient dazu, die Anwendung lokal oder in einer isolierten Umgebung mit festen Beispieldaten vorzufuehren.

Im Demo-Modus:

- kommt die Vertretungslogik nicht aus Live-Daten
- werden feste Demo-Daten verwendet
- ist das Datumsfenster auf einen festen Bereich begrenzt
- kann ein Admin einen globalen Demo-Datensatz erzeugen
- kann ein Demo-Scheduler im 60-Sekunden-Takt gestartet und gestoppt werden

## Demo aktivieren

In `.env.local`:

```env
APP_MODE=demo

# Demo-Datenbank
DEMO_DATABASE_URL=postgresql://REPLACE_ME

# Demo-Dispatch
DEMO_APP_BASE_URL=http://localhost:3000
DEMO_PUSH_CRON_SECRET=REPLACE_ME

# Demo-QStash
DEMO_QSTASH_URL=http://127.0.0.1:8080
DEMO_QSTASH_TOKEN=REPLACE_ME
DEMO_QSTASH_CURRENT_SIGNING_KEY=REPLACE_ME
DEMO_QSTASH_NEXT_SIGNING_KEY=REPLACE_ME
DEMO_QSTASH_SCHEDULE_LABEL=fds-dispatch-demo-v1
DEMO_QSTASH_CRON=* * * * *
```

Wichtig:

- `AUTH_SECRET` bleibt auch im Demo-Modus eine normale Basis-Variable.
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` und `VAPID_SUBJECT` bleiben ebenfalls Basis-Variablen.
- Die Prisma- und QStash-Skripte nutzen im Demo-Modus bevorzugt die `DEMO_*`-Werte.

## Lokales Setup

### 1. Abhaengigkeiten installieren

```bash
npm install
```

### 2. Lokales QStash starten

```bash
npx --yes @upstash/qstash-cli dev
```

Der Standard-Port ist `8080`.

### 3. Prisma fuer die Demo-Datenbank vorbereiten

```bash
npm run prisma:generate
npm run prisma:push
```

Im Demo-Modus verwenden diese Wrapper-Skripte automatisch `DEMO_DATABASE_URL`, wenn der Wert gesetzt ist.

### 4. Anwendung starten

```bash
npm run dev
```

## Fester Demo-Zeitraum

- Start: `2026-02-09`
- Referenzdatum: `2026-02-16`
- Ende: `2026-02-23`

Ausserhalb dieses Fensters sind Demo-Daten nicht vorgesehen.

## Demo-Ablauf

### 1. Ersten Benutzer registrieren

- `http://localhost:3000/stundenplan/register`

Der erste Benutzer muss zur ersten E-Mail aus `ADMIN_EMAILS` passen.

### 2. Stundenplan anlegen

- `http://localhost:3000/stundenplan/stundenplan`

### 3. Demo-Daten erzeugen

- `http://localhost:3000/stundenplan/admin`
- In der Benutzer-Tabelle den Button `Demo-Daten generieren` fuer den Zielbenutzer ausfuehren

Danach ist der globale Demo-Datensatz aktiv.

### 4. Demo-Daten pruefen

- Dashboard: `http://localhost:3000/stundenplan/dashboard`
- Oeffentliche Ansicht: `http://localhost:3000/`

## Demo-Scheduler

Startet einen Demo-Schedule im 60-Sekunden-Takt und schickt zusaetzlich einen ersten Dispatch mit kurzer Verzoegerung:

```bash
npm run demo:scheduler:start
```

Stoppt den Demo-Schedule:

```bash
npm run demo:scheduler:stop
```

Der Demo-Scheduler verwendet einen Summary-Dispatch ueber:

- `force=1`
- `sendUnchanged=1`

## Empfohlene Demo-Pruefung

```bash
npm run lint
npm run test:run
```

Danach manuell pruefen:

1. Registrierung des ersten Admin-Benutzers
2. Stundenplan-Onboarding
3. Demo-Datensatz-Erzeugung im Admin-Bereich
4. Sichtbare Daten im Dashboard
5. Sichtbare Daten in der oeffentlichen Ansicht
6. Optional den Demo-Scheduler einmal starten und wieder stoppen

## Troubleshooting

### Prisma findet keine Datenbank

Pruefen, ob `APP_MODE=demo` gesetzt ist und `DEMO_DATABASE_URL` gueltig ist.

### Demo-Scheduler startet nicht

Pruefen, ob `DEMO_QSTASH_TOKEN`, `DEMO_QSTASH_CURRENT_SIGNING_KEY`, `DEMO_QSTASH_NEXT_SIGNING_KEY`, `DEMO_APP_BASE_URL` und `DEMO_PUSH_CRON_SECRET` gesetzt sind.

### Keine Push-Tests moeglich

Pruefen, ob die Basis-Variablen fuer VAPID gesetzt sind:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
