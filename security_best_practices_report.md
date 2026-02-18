# Security Best Practices Report

## Executive Summary
A full security audit was performed across frontend, API routes, auth/session flow, and dependency posture.

- High-impact gaps around CSRF/request integrity, first-admin bootstrap control, and auth/register abuse throttling were addressed in this pass.
- Internal dispatch method surface was reduced (`POST` only).
- Residual risk remains in CSP strictness and distributed rate-limiting architecture.
- Dependency audit status: `npm audit --omit=dev` reported **0 production vulnerabilities**; dev-tooling advisories remain.

## Severity: Critical

### SEC-001: First-account admin bootstrap policy could be misconfigured/unsafe (Fixed)
Impact: If no strict bootstrap policy exists, first-account creation can grant unintended administrative control.

Status: **Fixed**

Evidence:
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/api/auth/register/route.ts:91`
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/api/auth/register/route.ts:99`
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/api/auth/register/route.ts:106`
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/lib/auth.ts:26`

Mitigation implemented:
- First account creation now fails closed with `503` if bootstrap admin email is not configured.
- When no admin exists, only the first configured `ADMIN_EMAILS` entry can create the first admin.

## Severity: High

### SEC-002: Missing strict same-origin checks on mutating cookie-authenticated APIs (Fixed)
Status: **Fixed**

Evidence:
- Shared enforcement helper: `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/lib/security/request-integrity.ts:51`
- Shared enforcement response: `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/lib/security/request-integrity.ts:69`
- Applied at user profile update: `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/api/me/route.ts:20`
- Applied at timetable update: `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/api/timetable/route.ts:39`
- Applied at admin user mutation: `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/api/admin/users/route.ts:135`
- Applied at admin teacher mutation: `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/api/admin/teachers/route.ts:35`
- Applied at push subscribe/unsubscribe/test mutation:
  - `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/api/push/subscribe/route.ts:16`
  - `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/api/push/unsubscribe/route.ts:6`
  - `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/api/push/test/route.ts:8`

Mitigation implemented:
- Production + non-demo: mutating routes enforce same-origin via `Origin`/`Referer`.
- Demo mode: checks intentionally bypassed for showcase/testing workflows.

### SEC-003: No abuse throttling for registration and credentials login (Fixed)
Status: **Fixed**

Evidence:
- Shared rate limiter store/logic: `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/lib/security/rate-limit.ts:33`
- Register IP/email throttles and `429` + `Retry-After`: `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/api/auth/register/route.ts:37`
- Credentials login IP + email/IP throttles: `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/lib/auth.ts:63`

Mitigation implemented:
- Register limits: `10/IP/15min`, `5/email/15min`.
- Login limits: `20/IP/15min`, `8/email+IP/15min` with fail-fast auth denial.

## Severity: Medium

### SEC-004: Internal dispatch endpoint accepted `GET` side-effect trigger (Fixed)
Status: **Fixed**

Evidence:
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/api/internal/push/dispatch/route.ts:87`

Mitigation implemented:
- `GET` now returns `405` with `Allow: POST`; dispatch runs only on `POST`.

### SEC-005: CSP policy still permits `unsafe-inline` (Remaining)
Status: **Remaining**

Evidence:
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/middleware.ts:14`
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/middleware.ts:32`

Risk:
- Inline script/style allowances weaken XSS impact reduction.

Recommendation:
- Move toward nonce/hash-based CSP for scripts and progressively reduce `unsafe-inline` usage.

### SEC-006: Rate limiting is per-instance in-memory only (Deferred)
Status: **Deferred**

Evidence:
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/lib/security/rate-limit.ts:33`

Risk:
- Limits are not globally enforced across horizontally scaled instances.

Recommendation:
- Migrate throttling state to shared storage (e.g., Redis/Upstash) for distributed consistency.

## Severity: Low

### SEC-007: Dev dependency advisories in lint toolchain (Deferred)
Status: **Deferred**

Evidence:
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/package.json:46`
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/package.json:57`
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/package.json:58`

Notes:
- `npm audit --omit=dev` is clean.
- Full `npm audit` reports moderate dev-only advisories in eslint-related tooling.

## Verification Notes
- `npm run lint`: pass
- `npm run test:run`: all newly added security tests pass; pre-existing unrelated failures remain in `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/lib/promo-dismissal.test.ts` (`window.localStorage.clear is not a function`).
