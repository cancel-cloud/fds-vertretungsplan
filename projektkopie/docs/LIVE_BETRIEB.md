# Live-Betrieb und Installation

Dieses Dokument beschreibt die Inbetriebnahme fuer den echten Betrieb der Anwendung. Es deckt sowohl Vercel als auch Self-Hosting mit Node.js, PostgreSQL und HTTPS ab.

## Live vs. Demo

Live-Betrieb:

- nutzt die normalen Basis-Variablen wie `DATABASE_URL`, `APP_BASE_URL` und `QSTASH_*`
- holt Vertretungsdaten ueber die normale WebUntis-Konfiguration
- verwendet standardmaessig einen QStash-Cron von `*/15 * * * *`

Demo-Betrieb:

- wird nur durch `APP_MODE=demo` aktiviert
- nutzt zusaetzliche `DEMO_*`-Variablen fuer demo-aware Teile
- verwendet einen eigenen Demo-Workflow

Fuer den Live-Betrieb darf `APP_MODE` nicht auf `demo` gesetzt sein.

## Gemeinsame Voraussetzungen

- Node.js 20 oder neuer
- PostgreSQL
- eine von aussen erreichbare HTTPS-Domain
- ein Upstash-QStash-Projekt fuer den automatischen Dispatch
- VAPID-Schluessel fuer Web Push

## Pflichtvariablen fuer den Live-Betrieb

```env
AUTH_SECRET=replace-with-a-long-random-secret
ADMIN_EMAILS=bootstrap-admin@example.com,second-admin@example.com
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
APP_BASE_URL=https://your-domain.example

VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@example.com
PUSH_APP_NAME=FDS Stundenplan

PUSH_CRON_SECRET=replace-with-a-long-random-secret

QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
```

Bedeutung:

- `AUTH_SECRET`: Secret fuer NextAuth
- `ADMIN_EMAILS`: kommagetrennte Admin-Liste; die erste E-Mail ist der Bootstrap-Admin
- `DATABASE_URL`: PostgreSQL-Verbindung fuer Prisma
- `APP_BASE_URL`: oeffentliche HTTPS-Basis-URL der Anwendung
- `VAPID_*`: notwendig fuer Web Push
- `PUSH_CRON_SECRET`: Bearer-Secret fuer den Dispatch-Webhook
- `QSTASH_*`: Verbindung und Signaturpruefung fuer Upstash QStash

## Optionale und erweiterte Variablen

```env
APP_TIMEZONE=Europe/Berlin
BCRYPT_ROUNDS=12
UNTIS_SCHOOL=friedrich-dessauer-schule-limburg
UNTIS_BASE_URL=https://friedrich-dessauer-schule-limburg.webuntis.com
QSTASH_URL=https://qstash.upstash.io
QSTASH_CRON=*/15 * * * *
QSTASH_SCHEDULE_LABEL=fds-dispatch-v1
QSTASH_EXPECTED_URL=

NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
POSTHOG_API_KEY=
POSTHOG_HOST=https://eu.i.posthog.com
```

Hinweise:

- `UNTIS_SCHOOL` ist optional. Ohne Angabe wird `friedrich-dessauer-schule-limburg` verwendet.
- `UNTIS_BASE_URL` ist optional. Ohne Angabe wird `https://<UNTIS_SCHOOL>.webuntis.com` verwendet.
- Falls `UNTIS_BASE_URL` gesetzt wird, muss die URL `https://*.webuntis.com` verwenden.
- `QSTASH_EXPECTED_URL` ist nur fuer Sonderfaelle hinter Reverse Proxy oder bei Host-Mismatch bei der QStash-Signaturpruefung gedacht.
- Analytics ist optional.

## VAPID-Schluessel erzeugen

```bash
npx web-push generate-vapid-keys
```

Die erzeugten Werte in `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` und `VAPID_SUBJECT` uebernehmen.

## Datenbank und Prisma vorbereiten

```bash
npm install
npm run prisma:generate
npm run prisma:push
```

Hinweise:

- Das Projekt unterstuetzt als Datenbank nur PostgreSQL.
- Fuer den Live-Betrieb wird `DATABASE_URL` verwendet.
- `npm run build` fuehrt vor dem Build `prisma generate` direkt ueber `prebuild` aus. Dafuer muss beim Build eine gueltige `DATABASE_URL` fuer Prisma sichtbar sein.

## Anwendung bauen und starten

```bash
npm run build
npm run start
```

## Admin-Bootstrap und Erstinbetriebnahme

Der erste Login-/Registrierungsablauf hat feste Regeln:

- Solange noch kein Admin existiert, darf nur die erste E-Mail aus `ADMIN_EMAILS` den ersten Account anlegen.
- Ist `ADMIN_EMAILS` leer und es existiert noch kein Admin, blockiert die Registrierung mit `503`.
- Weitere E-Mails aus `ADMIN_EMAILS` erhalten bei Registrierung ebenfalls die Rolle `ADMIN`.

Nach dem ersten Deploy:

1. Anwendung mit gesetzten Live-Variablen bereitstellen
2. `https://<domain>/stundenplan/register` aufrufen
3. Den ersten Account mit der ersten E-Mail aus `ADMIN_EMAILS` registrieren
4. Falls noch keine Lehrer hinterlegt sind, oeffnet sich die Admin-Ersteinrichtung
5. Unter `https://<domain>/stundenplan/admin-setup` mindestens einen Lehrer mit Kuerzel und vollem Namen anlegen
6. Danach das Onboarding und den eigenen Stundenplan abschliessen

Hinweis:

- Der letzte Admin kann spaeter nicht zu `USER` herabgestuft werden.

## QStash fuer den Live-Betrieb scharf schalten

Nach dem ersten erfolgreichen Deploy und mit gueltigen Produktionswerten:

```bash
npm run qstash:schedule
```

Dieses Skript erstellt oder aktualisiert den geplanten Dispatch fuer:

- Route: `POST /api/internal/push/dispatch`
- Standard-Cron im Live-Betrieb: `*/15 * * * *`
- Standard-Label: `fds-dispatch-v1`

Die Anwendung versendet Pushes standardmaessig nur:

- montags bis freitags
- zwischen `06:00` und `20:00`

## Sicherheits- und Betriebsgrenzen

- Schreibende Cookie-Auth-Endpunkte erzwingen in Produktion Same-Origin-Pruefung ueber `Origin` oder `Referer`
- Registrierung und Login sind rate-limitiert
- QStash-Requests werden ueber Signing Keys geprueft
- Das Bearer-Secret fuer den Dispatch muss zum gesetzten `PUSH_CRON_SECRET` oder `CRON_SECRET` passen

## Smoke-Tests nach der Inbetriebnahme

### Technische Grundpruefung

```bash
npm run lint
npm run test:run
npm run build
```

### Dispatch manuell ausloesen

```bash
curl -X POST "https://your-domain.example/api/internal/push/dispatch?force=1" \
  -H "Authorization: Bearer <PUSH_CRON_SECRET>"
```

### Optional gezielten Benutzer testen

```bash
curl -X POST "https://your-domain.example/api/internal/push/dispatch?force=1&userEmail=user@example.com&device=ios&sendUnchanged=1" \
  -H "Authorization: Bearer <PUSH_CRON_SECRET>"
```

## Betrieb auf Vercel

Empfohlener Ablauf:

1. Projekt in Vercel bereitstellen
2. Alle Live-Variablen in den Projekt-Einstellungen setzen
3. Externe PostgreSQL-Datenbank anbinden
4. Sicherstellen, dass `APP_BASE_URL` der produktiven Vercel-Domain entspricht
5. Nach dem ersten Deploy `npm run qstash:schedule` mit den Produktionswerten ausfuehren
6. Bootstrap-Admin registrieren und Admin-Ersteinrichtung durchlaufen

Hinweise fuer Vercel:

- QStash benoetigt eine oeffentlich erreichbare HTTPS-URL
- `APP_BASE_URL` sollte auf die produktive Vercel-Domain zeigen
- Falls Signaturen wegen Proxy- oder Host-Umschreibung fehlschlagen, kann `QSTASH_EXPECTED_URL` explizit gesetzt werden

## Self-Hosting mit Node.js

Empfohlener Ablauf:

1. Server mit Node.js 20+, PostgreSQL und HTTPS-Proxy bereitstellen
2. Projektdateien auf den Server uebertragen
3. Produktions-`.env.local` oder entsprechende Umgebungsvariablen setzen
4. Abhaengigkeiten installieren:

```bash
npm install
```

5. Prisma vorbereiten:

```bash
npm run prisma:generate
npm run prisma:push
```

6. Anwendung bauen und starten:

```bash
npm run build
npm run start
```

7. Reverse Proxy so konfigurieren, dass die Anwendung unter einer festen HTTPS-Domain erreichbar ist
8. `APP_BASE_URL` exakt auf diese externe Domain setzen
9. Danach `npm run qstash:schedule` ausfuehren

Hinweise fuer Self-Hosting:

- Ohne oeffentliche HTTPS-Domain funktionieren QStash und Web Push nicht zuverlaessig
- Bei Proxy-Weiterleitungen muessen Host und Proto korrekt durchgereicht werden
- Falls die Signaturpruefung trotz korrektem Setup scheitert, `QSTASH_EXPECTED_URL` auf die oeffentliche Dispatch-URL setzen
