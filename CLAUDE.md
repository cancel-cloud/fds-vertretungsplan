# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FDS Vertretungsplan — a full-stack substitution plan app for Friedrich-Dessauer-Schule Limburg. Built with Next.js (App Router), NextAuth (credentials), Prisma (PostgreSQL), and Web Push notifications (VAPID + Upstash QStash).

## Commands

```bash
npm run dev              # Dev server with Turbopack (http://localhost:3000)
npm run build            # Production build
npm run lint             # ESLint (next/core-web-vitals + TypeScript)
npm run test             # Vitest watch mode
npm run test:run         # Vitest single run (CI)
npm run test:coverage    # Vitest with coverage
npm run prisma:generate  # Generate Prisma client after schema changes
npm run prisma:push      # Push schema to database
npm run qstash:schedule  # Configure Upstash QStash cron (15-min dispatch)
```

Run `npm run test:run && npm run lint` before opening a PR.

## Architecture

### Routing & Pages

App Router under `src/app/`. Two main areas:
- **Public**: `/` (landing), `/newui` (public substitution view), `/impressum`, `/datenschutz`
- **Authenticated** (`/stundenplan/*`): dashboard, timetable manager, settings, admin panel, onboarding. Protected by middleware (`src/middleware.ts`) which redirects unauthenticated users to `/stundenplan/login`.

### API Routes (`src/app/api/`)

- `/api/substitutions?date=YYYYMMDD` — WebUntis proxy with in-memory cache (30s TTL, stale-if-error 30min), rate limiting (60 req/min), retry with exponential backoff
- `/api/timetable` — GET/PUT for user's schedule entries
- `/api/push/subscribe|unsubscribe|test|last-target` — VAPID push subscription management
- `/api/internal/push/dispatch` — QStash webhook endpoint for scheduled push notification delivery (Mo–Fr 06:00–20:00)
- `/api/admin/teachers|users` — Admin CRUD
- `/api/auth/register` — Registration with email domain validation
- `/api/me` — Current user data

### Auth

NextAuth with Credentials provider (`src/lib/auth.ts`). JWT session strategy, bcryptjs password hashing. Role-based: `USER` | `ADMIN`. First registered user becomes admin. Auth guards in `src/lib/auth/guards.ts` (`requireUser()`, `requireAdmin()`).

### Database (Prisma)

Schema at `prisma/schema.prisma`. Key models: `User`, `TimetableEntry` (schedule with weekday/period/subject/teacher/weekMode), `TeacherDirectory` (teacher code→name), `PushSubscription`, `NotificationFingerprint` + `NotificationState` (delta-based push dedup), `AppSettings` (allowed email domains).

### Push Notifications

Delta-based: fingerprint (hash of matching substitutions) is compared to `NotificationState` — only sends when data actually changes. VAPID keys for Web Push standard. Upstash QStash triggers `/api/internal/push/dispatch` every 15 minutes. Service worker at `public/sw.js` handles `push` and `notificationclick` events.

### Key Libraries

- **UI**: shadcn/ui + Radix UI + lucide-react icons
- **Styling**: Tailwind CSS 4 with CSS variables (custom theme in `globals.css`), `cn()` utility (clsx + tailwind-merge)
- **Analytics**: PostHog (client + server-side, optional)

## Code Conventions

- TypeScript strict mode. Use `@/` import alias for `src/`.
- Server components by default; minimize `'use client'`. Wrap client components in Suspense.
- Functional components with named exports, PascalCase filenames.
- Utilities/hooks: kebab-case filenames (`date-utils.ts`, `use-substitutions.ts`).
- Event handlers: `handle` prefix (`handleClick`, `handleKeyDown`).
- Descriptive variable names with auxiliary verbs (`isLoading`, `hasError`).
- Prefer interfaces over types. Avoid enums; use maps instead.
- Use early returns for readability.
- Tailwind for all styling; no inline CSS or `<style>` tags.
- Formatting: Prettier (2-space indent, trailing commas es5, Tailwind plugin).
- Conventional Commits: `feat:`, `fix:`, `test:`, optionally scoped (`fix(csp): ...`).

## Testing

Vitest with jsdom + Testing Library (`src/test/setup.ts`). Test files colocated: `src/**/*.test.ts(x)`. Existing test coverage for `date-utils`, `schedule-matching`, `data-processing`, `notification-state`, `retry-utils`.

## Local Development

- Uses custom domain `https://vertretungsplan.local` (not localhost) for HTTPS/cookie compatibility.
- Session cookies use `__Secure-` prefix (requires HTTPS).
- CSP is relaxed in dev mode (allows `unsafe-eval`, wildcard `connect-src`).
- Environment variables: see `.env.example` or README.md for the full list. Key ones: `DATABASE_URL`, `AUTH_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `UNTIS_SCHOOL`, `UNTIS_BASE_URL`.