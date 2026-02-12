# 📚 FDS Vertretungsplan V2

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)
![React](https://img.shields.io/badge/React-19.x-61DAFB)

Eine moderne, persönliche Vertretungsplan-App für die Friedrich-Dessauer-Schule Limburg.

V2 kombiniert:
- 🌍 **Öffentliche Vertretungsansicht** unter `/`
- 👤 **Persönlichen Bereich** unter `/stundenplan` mit Account, eigenem Stundenplan und Push-Benachrichtigungen

---

## ✨ Was ist neu in V2?

- 🔐 **User-System** mit Registrierung/Login (E-Mail + Passwort)
- 🧑‍🏫 **Admin-Bereich** mit Lehrer-Kürzel ↔ Vollname und User-Verwaltung
- 🗓️ **Persönlicher Stundenplan** (Mo–Fr, 1–16, Einzel-/Doppelstunde, gerade/ungerade Woche)
- 🎯 **Relevanz-Matching**: Nur Vertretungen, die wirklich zu deinem Stundenplan passen
- 🔔 **Web Push Notifications** (iOS/Browser via VAPID)
- 🧠 **Anti-Spam-Logik**: Push nur bei Änderungen (Delta-basiert)
- ⚙️ **User-Settings**: Vorschau-Tage `1..5` Schultage (Default `1`)
- ☁️ **Upstash QStash** Scheduler für automatischen 15-Minuten-Dispatch

---

## 🏗️ Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Prisma + PostgreSQL**
- **NextAuth (Credentials)**
- **web-push** (VAPID)
- **Upstash QStash**

---

## 🚀 Schnellstart (Lokal)

### 1) Repository klonen + installieren

```bash
git clone https://github.com/cancel-cloud/fds-vertretungsplan.git
cd fds-vertretungsplan
npm install
```

### 2) `.env.local` anlegen

```env
# WebUntis
UNTIS_SCHOOL=friedrich-dessauer-schule-limburg
UNTIS_BASE_URL=https://friedrich-dessauer-schule-limburg.webuntis.com

# Auth
AUTH_SECRET=replace-with-a-long-random-secret
ADMIN_EMAILS=
APP_TIMEZONE=Europe/Berlin

# Database
DATABASE_URL=postgresql://fds:fds-password@localhost:5432/fds?schema=public

# Push (VAPID)
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@example.com
PUSH_APP_NAME=FDS Stundenplan

# Dispatch Secret
PUSH_CRON_SECRET=replace-with-a-long-random-secret
# optional fallback
CRON_SECRET=

# Upstash QStash
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
QSTASH_URL=https://qstash.upstash.io
QSTASH_CRON=*/15 * * * *
QSTASH_SCHEDULE_LABEL=fds-dispatch-v1
APP_BASE_URL=https://your-domain.example
QSTASH_EXPECTED_URL=

# Dev
ALLOWED_DEV_ORIGINS=
NEXT_PUBLIC_ENABLE_FOREGROUND_POLLING_NOTIFICATIONS=false

# Optional Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
POSTHOG_API_KEY=
POSTHOG_HOST=https://eu.i.posthog.com
```

### 3) VAPID Keys generieren

```bash
npx web-push generate-vapid-keys
```

### 4) Prisma synchronisieren

```bash
npm run prisma:generate
npm run prisma:push
```

### 5) Development starten

```bash
npm run dev
```

Danach:
- 🌍 `http://localhost:3000/`
- 👤 `http://localhost:3000/stundenplan`

---

## ☁️ Upstash QStash korrekt einrichten

Wenn der automatische Dispatch laufen soll, brauchst du einen **Upstash-Account**.

### Schritt-für-Schritt

1. Account erstellen: [https://upstash.com](https://upstash.com)
2. In QStash folgende Werte kopieren und in `.env.local` setzen:
   - `QSTASH_TOKEN`
   - `QSTASH_CURRENT_SIGNING_KEY`
   - `QSTASH_NEXT_SIGNING_KEY`
3. `APP_BASE_URL` auf deine echte, von außen erreichbare URL setzen
   - Vercel: `https://dein-projekt.vercel.app`
   - Self-hosted: `https://vertretungsplan.example`
4. `PUSH_CRON_SECRET` setzen
5. Schedule anlegen/aktualisieren:

```bash
npm run qstash:schedule
```

Das Script erstellt/aktualisiert einen Job, der `POST /api/internal/push/dispatch` im 15-Minuten-Intervall aufruft.

### Wichtige Hinweise

- 🕒 Dispatch-Fenster: **Mo–Fr, 06:00–20:00**
- 🧠 Delta-Logik: Nur neue/geänderte Treffer erzeugen Push
- 🚫 `localhost` ist für QStash ohne Tunnel nicht direkt erreichbar

---

## 🧪 Manuelle Tests

### Force-Dispatch

```bash
curl -X POST "https://your-domain.example/api/internal/push/dispatch?force=1" \
  -H "Authorization: Bearer <PUSH_CRON_SECRET>"
```

### Gezielt testen (ein User, nur iOS, auch ohne Delta)

```bash
curl -X POST "https://your-domain.example/api/internal/push/dispatch?force=1&userEmail=lukas@devbrew.dev&device=ios&sendUnchanged=1" \
  -H "Authorization: Bearer <PUSH_CRON_SECRET>"
```

`sendUnchanged=1` ist nur für Iteration/Debug gedacht.

---

## 👨‍💼 Admin-Setup (First Run)

- Der **erste registrierte User** wird Admin
- Beim ersten Admin-Setup müssen erlaubte E-Mail-Domains gesetzt werden
- Danach im Admin-Bereich:
  - Lehrer-Kürzel verwalten
  - User-Rollen/Notification-Status verwalten
  - Push-Tests ausführen

---

## 🧭 Relevante Routen

- `/` öffentliche Ansicht
- `/newui` alternative UI
- `/stundenplan` Root-Redirect
- `/stundenplan/login`
- `/stundenplan/register`
- `/stundenplan/onboarding`
- `/stundenplan/dashboard`
- `/stundenplan/stundenplan`
- `/stundenplan/settings`
- `/stundenplan/admin`

---

## ✅ Qualität

```bash
npm run lint
npm run test:run
npm run build
```

---

## 🚢 Deployment

### Vercel

- Env-Variablen setzen
- `APP_BASE_URL` auf die produktive URL setzen
- Nach erstem Deploy einmal `npm run qstash:schedule` ausführen

### Self-hosted

- Node.js 20+
- PostgreSQL
- HTTPS-Domain (öffentlich erreichbar)
- Build + Run:

```bash
npm run build
npm run start
```

---

## 🔒 Sicherheit

- Keine Secrets committen
- Nur `.env.local`/Secret Manager verwenden
- `AUTH_SECRET` und `PUSH_CRON_SECRET` stark und einzigartig setzen

---

## 📄 Lizenz

[MIT](./LICENSE)
