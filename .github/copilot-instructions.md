# FDS Vertretungsplan

FDS Vertretungsplan is a Next.js web application that displays substitution plans for FDS Limburg school. It fetches data from a WebUntis API and provides a responsive interface for students to view today's and tomorrow's schedule changes.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Setup

- Check Node.js version: `node --version` (should be 20+)
- Install dependencies: `npm install` -- takes 60 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- Check installation: Verify no critical errors in npm install output

### Development Workflow

- Start development server: `npm run dev` -- takes 2 seconds to start. NEVER CANCEL. Set timeout to 30+ seconds.
  - Runs on http://localhost:3000
  - Hot reload is enabled
  - Console may show PostHog and Vercel Analytics warnings (non-critical)
- Build for production: `npm run build` -- takes 30 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- Start production server: `npm start` -- takes 1 second after build. NEVER CANCEL. Set timeout to 30+ seconds.
  - Must run `npm run build` first
  - Runs on http://localhost:3000

### Code Quality

- Run linting: `npm run lint` -- takes 3 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- Check formatting: `npx prettier --check .` -- takes 2 seconds. Set timeout to 60+ seconds.
- Fix formatting: `npx prettier --write .` -- takes 2 seconds. Set timeout to 60+ seconds.
- ALWAYS run `npm run lint` before committing changes

## Validation

### Manual Testing Requirements

ALWAYS manually validate changes by testing the complete user workflow:

1. **Start the application**: Run `npm run dev` and navigate to http://localhost:3000
2. **Test main functionality**:
   - Verify the main page loads with "Vertretungsplan FDS-Limburg" header
   - Test the search box (type any text to verify it responds)
   - Click the "Morgen" (tomorrow) toggle switch - it should become checked
   - Verify the substitution plan data attempts to load (may show loading or error state)
3. **Test navigation**:
   - Click "Impressum" link - should navigate to /impressum with legal information
   - Click "Datenschutz" link - should navigate to /datenschutz with privacy policy
   - Click "Home" link - should return to main page
   - Click "FDS-IServ" link - should open external link
4. **Test responsive behavior**: Resize browser window to test mobile/tablet views

### Build Validation

- ALWAYS run the complete build process after making changes: `npm run build`
- Verify build succeeds without errors
- Test production mode: `npm run build && npm start`
- No tests are configured in this project - manual testing is the primary validation method

### API Functionality

- The app fetches substitution data from WebUntis API via `/api/getSubstitutionData`
- API requires POST requests with date parameter
- External API may be unavailable - this is normal and should not block development

## Common Tasks

### Making Code Changes

- Primary codebase is in TypeScript with React/Next.js
- Always check TypeScript compilation with `npm run build`
- Follow existing code patterns and component structure
- Use Tailwind CSS for styling (follow existing utility class patterns)

### Key File Locations

- Main page: `src/pages/index.tsx`
- Components: `src/components/` (Header.tsx, SubstitutionPlan.tsx, SearchBar.tsx, etc.)
- API endpoints: `src/pages/api/` (getSubstitutionData.ts, getDate.ts)
- Static pages: `src/pages/impressum.tsx`, `src/pages/datenschutz.tsx`
- App router files: `src/app/` (layout.tsx, providers.tsx)
- Styles: `src/styles/globals.css`
- Configuration: `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`

### Repository Structure

```
fds-vertretungsplan/
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier configuration
├── next.config.mjs         # Next.js configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── src/
│   ├── app/                # App router files (newer Next.js structure)
│   ├── pages/              # Pages router files (main structure)
│   │   ├── api/            # API endpoints
│   │   ├── index.tsx       # Main page
│   │   ├── impressum.tsx   # Legal page
│   │   └── datenschutz.tsx # Privacy page
│   ├── components/         # React components
│   └── styles/             # CSS files
└── public/                 # Static assets
```

## Troubleshooting

### Common Issues

- **Build fails**: Run `npm run lint` first to check for TypeScript/ESLint errors
- **Dev server won't start**: Check if port 3000 is already in use
- **Production server fails**: Ensure you ran `npm run build` first
- **API errors**: External WebUntis API may be unavailable - this is expected and normal
- **Console warnings**: PostHog and Vercel Analytics warnings are non-critical
- **Formatting issues**: Run `npx prettier --write .` to auto-fix formatting

### Performance Notes

- Build time: ~30 seconds (normal)
- Dev server startup: ~2 seconds (normal)
- Install time: ~60 seconds (normal)
- All operations are fast - if commands hang for >5 minutes, investigate

### External Dependencies

- The application depends on the WebUntis API for substitution data
- API endpoint: `https://hepta.webuntis.com/WebUntis/monitor/substitution/data`
- API may be unavailable during development - this should not block code changes

## Critical Reminders

- **NEVER CANCEL** build or install commands - they complete quickly (<2 minutes)
- **ALWAYS** test manually after making changes
- **ALWAYS** run `npm run lint` before committing
- **NO TESTS** are configured - rely on manual validation
- **BUILD FAST** - typical build is 30 seconds, much faster than typical Next.js projects
- Use appropriate timeouts: 120+ seconds for builds, 60+ seconds for lint/format commands
