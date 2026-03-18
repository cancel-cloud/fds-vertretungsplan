# Repository Guidelines

## Project Structure & Module Organization
Core application code lives in `src/`:
- `src/app/`: Next.js App Router pages and API routes (`src/app/api/substitutions/route.ts`).
- `src/components/`: UI and layout components (`ui/`, `layout/`, legal content).
- `src/lib/`: shared utilities, analytics helpers, data processing, and date logic.
- `src/hooks/`: reusable React hooks (for example `use-substitutions.ts`).
- `src/providers/`, `src/types/`, `src/data/`, `src/test/`: providers, types, sample data, and test setup.

Configuration files are at the repo root (`next.config.ts`, `vitest.config.ts`, `eslint.config.mjs`, `.prettierrc`).

## Build, Test, and Development Commands
- `npm run dev`: start local development server with Turbopack on `http://localhost:3000`.
<<<<<<< ours
- `npm run prebuild`: runs `prisma generate` automatically before `npm run build`.
=======
- `npm run prebuild`: generate Prisma client before build (runs automatically with `npm run build`).
>>>>>>> theirs
- `npm run build`: create a production build.
- `npm run start`: run the production server from the build output.
- `npm run lint`: run ESLint (Next.js core-web-vitals + TypeScript rules).
- `npm run test`: start Vitest in watch mode.
- `npm run test:run`: run tests once (CI-friendly).
- `npm run test:coverage`: run tests with coverage reporting.

## Operational Workflows & Scripts
- `npm run prisma:generate`: generate Prisma client using `.env.local` (preferred over raw `prisma ...`); when `APP_MODE=demo`, the wrapper uses `DEMO_DATABASE_URL` as `DATABASE_URL`.
- `npm run prisma:push`: push Prisma schema to the configured database from `.env.local`; uses the same demo-aware `DEMO_DATABASE_URL` fallback behavior as `prisma:generate` when `APP_MODE=demo`.
- `npm run qstash:schedule`: (re)create the Upstash QStash dispatch schedule after first deploy or config changes (uses demo-aware `DEMO_*` fallbacks in demo mode).
- `npm run demo:scheduler:start` / `npm run demo:scheduler:stop`: start/stop the demo dispatch scheduler; `start` also sends a delayed kickoff dispatch and both commands accept `DEMO_*` env vars with base-var fallback.
- QStash scheduler defaults: production `QSTASH_CRON` defaults to `*/15 * * * *`; demo defaults to `* * * * *` unless overridden.
- QStash auth/env requirements: provide `APP_BASE_URL`, `QSTASH_TOKEN`, and `PUSH_CRON_SECRET` (or `CRON_SECRET`) plus demo equivalents (`DEMO_*`) when running in demo mode.

## Coding Style & Naming Conventions
- Language: TypeScript (`.ts`/`.tsx`) with 2-space indentation and semicolons.
- Formatting: Prettier (`tabWidth: 2`, `trailingComma: es5`) with Tailwind plugin.
- Components: use PascalCase file names for component files (e.g. `SubstitutionCard` pattern).
- Helpers/hooks: use kebab-case files (`date-utils.ts`, `use-substitutions.ts`), and keep modules focused.
- Use `@/` imports (configured in `vitest.config.ts` and `tsconfig.json`) for `src` aliases.

## Testing Guidelines
- Framework: Vitest with `jsdom` and Testing Library setup from `src/test/setup.ts`.
- Test file patterns: `src/**/*.test.ts` and `src/**/*.test.tsx`.
- Prefer colocated tests near the module under test (examples: `src/lib/utils.test.ts`, `src/app/api/substitutions/route.test.ts`).
- Run `npm run test:run && npm run lint` before opening a PR.

## Commit & Pull Request Guidelines
- Follow Conventional Commit style seen in history: `feat:`, `fix:`, `test:`, optionally scoped (`fix(csp): ...`).
- Keep commits focused and descriptive; avoid generic messages.
- PRs should include:
1. A short summary of behavior changes.
2. Linked issue(s) when applicable.
3. Screenshots/GIFs for UI changes.
4. Notes about env/config changes (for example new PostHog or Untis variables).

## Security & Configuration Tips
- Keep secrets only in `.env.local`; never commit API keys or school credentials.
- Prefer the provided wrapper scripts (`npm run prisma:*`, `npm run qstash:schedule`, `npm run demo:scheduler:*`) over raw CLI commands so demo/prod env resolution stays consistent.
- When touching `src/app/api/substitutions/route.ts` or analytics code, preserve existing validation and CSP-related protections.
