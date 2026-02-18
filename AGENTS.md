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
- `npm run build`: create a production build.
- `npm run start`: run the production server from the build output.
- `npm run lint`: run ESLint (Next.js core-web-vitals + TypeScript rules).
- `npm run test`: start Vitest in watch mode.
- `npm run test:run`: run tests once (CI-friendly).
- `npm run test:coverage`: run tests with coverage reporting.

## Operational Workflows & Scripts
- `npm run prisma:generate`: generate Prisma client using `.env.local` (preferred over raw `prisma ...`).
- `npm run prisma:push`: push Prisma schema to the configured database from `.env.local`.
- `npm run qstash:schedule`: (re)create the Upstash QStash dispatch schedule after first deploy or config changes.
- `npm run demo:scheduler:start` / `npm run demo:scheduler:stop`: start/stop the demo mode dispatch scheduler (requires `APP_MODE=demo` and demo env vars).

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
- When touching `src/app/api/substitutions/route.ts` or analytics code, preserve existing validation and CSP-related protections.
