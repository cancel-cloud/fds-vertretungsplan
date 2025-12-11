# 📚 FDS Vertretungsplan V2

A modern, fast, and user-friendly substitution plan viewer for the Friedrich-Dessauer-Schule Limburg. Built with Next.js 15, this V2 version transforms the traditional school substitution plan into an interactive web application with real-time data from WebUntis.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)

---

## ✨ Why Choose FDS Vertretungsplan V2?

### 🚀 **Lightning Fast Performance**
- **In-Memory Caching**: Intelligent caching system reduces API calls and speeds up data retrieval by up to 90%
- **Server-Side Rendering**: Leverages Next.js 15's App Router for optimal performance and SEO
- **Turbopack**: Ultra-fast bundler in development mode for instant hot reloading
- **Optimized Bundle Size**: Production builds are optimized for minimal load times

### 🎨 **Modern & Intuitive UI/UX**
- **Responsive Design**: Seamlessly adapts from mobile phones to large desktop screens
- **Dark/Light/System Themes**: Beautiful theme system with persistent user preferences
- **Smooth Animations**: Delightful interactions powered by Tailwind CSS animations
- **Welcome Experience**: First-time users are greeted with confetti and a guided tour
- **Accessible Components**: Built with Radix UI primitives for maximum accessibility

### 🔍 **Powerful Search & Filtering**
- **Real-Time Search**: Instantly search across classes, teachers, subjects, rooms, and more
- **Category Filters**: Filter by substitution types (Entfall, Vertretung, Raumänderung, etc.)
- **Combined Filtering**: Use search and categories together for precise results
- **Smart Sorting**: Substitutions are automatically sorted by priority (cancellations first) and time
- **URL State Sync**: Search terms are persisted in the URL for easy sharing

### 📅 **Intuitive Calendar Navigation**
- **Interactive Calendar Widget**: Easily navigate to any date with a clean calendar interface
- **Visual Indicators**: Current date and selected date are clearly highlighted
- **Month Navigation**: Quickly jump between months with smooth transitions
- **Adjacent Month Support**: Click dates from previous/next months to navigate seamlessly

### 📊 **Real-Time Data Integration**
- **WebUntis API**: Direct integration with WebUntis for authentic, up-to-date substitution data
- **Automatic Refresh**: Data is automatically refreshed when selecting different dates
- **Error Handling**: Robust retry mechanisms with exponential backoff for network resilience
- **Meta Information**: Displays last update time and handles school holidays gracefully

### 🛡️ **Security & Privacy**
- **GDPR Compliant**: Comprehensive privacy policy (Datenschutz) and legal notice (Impressum)
- **No Tracking by Default**: Privacy-focused analytics with PostHog (respects user preferences)
- **Secure API Proxy**: Server-side API calls protect sensitive credentials
- **Environment Variables**: Secure configuration through environment variables

### 🔧 **Developer-Friendly Architecture**
- **TypeScript First**: Fully typed codebase with strict type checking
- **Component Library**: Reusable UI components with ShadCN/UI
- **Clean Code Structure**: Well-organized folders (components, hooks, services, types)
- **Custom Hooks**: Reusable logic for data fetching and state management
- **Error Boundaries**: Graceful error handling with fallback UIs

---

## 🎯 Key Features

### For Students & Teachers
- ✅ View substitutions for any date with a single click
- ✅ Search for your class, teacher, or subject instantly
- ✅ Filter by substitution type to see only what matters to you
- ✅ See cancellations (Entfall) prominently at the top
- ✅ Check room changes and substitutions at a glance
- ✅ Mobile-friendly for on-the-go access
- ✅ Theme customization for comfortable viewing in any lighting

### For Administrators
- ✅ Real-time data sync with WebUntis
- ✅ No manual data entry required
- ✅ Configurable school name and API endpoints
- ✅ Analytics integration for usage insights (optional)
- ✅ Easy deployment on Vercel or any Node.js hosting
- ✅ MIT licensed for full flexibility

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)**: React framework with App Router and Server Components
- **[React 19](https://react.dev/)**: Latest React with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[ShadCN/UI](https://ui.shadcn.com/)**: High-quality, accessible component library
- **[Radix UI](https://www.radix-ui.com/)**: Unstyled, accessible component primitives
- **[Lucide React](https://lucide.dev/)**: Beautiful & consistent icon library
- **[date-fns](https://date-fns.org/)**: Modern JavaScript date utility library
- **[canvas-confetti](https://www.npmjs.com/package/canvas-confetti)**: Celebratory animations

### Backend & API
- **Next.js API Routes**: Server-side API endpoints for WebUntis integration
- **WebUntis Integration**: Direct connection to school's WebUntis system
- **In-Memory Caching**: 5-minute cache duration for optimal performance

### Development Tools
- **ESLint**: Code linting and quality checks
- **Prettier**: Code formatting
- **PostHog**: Privacy-focused product analytics
- **Vercel Analytics & Speed Insights**: Performance monitoring

### Hosting & Deployment
- **Optimized for Vercel**: One-click deployment with automatic CI/CD
- **Environment Variables**: Secure configuration management
- **Server-Side Rendering**: SEO-friendly and fast initial page loads

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 20+** (LTS recommended)
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- Access to a WebUntis school account (optional for development, required for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cancel-cloud/fds-vertretungsplan.git
   cd fds-vertretungsplan
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # WebUntis Configuration (Required for production)
   UNTIS_SCHOOL=your-school-name
   UNTIS_BASE_URL=https://your-school.webuntis.com
   
   # Optional: Analytics (remove if not needed)
   NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
   
   # Optional: Feature flags
   NEXT_PUBLIC_ENABLE_WELCOME=true
   NEXT_PUBLIC_USE_SAMPLE_DATA=false
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
npm run build
npm start
```

The production build is optimized for performance and includes:
- Minified JavaScript and CSS
- Server-side rendering
- Automatic code splitting
- Optimized images and fonts

---

## 📖 Usage Guide

### For End Users

#### Viewing Substitutions
1. Open the application in your browser
2. The current day's substitutions are displayed by default
3. Use the calendar widget (desktop sidebar or mobile menu) to select a different date

#### Searching & Filtering
1. **Search**: Use the search bar to find specific classes, teachers, subjects, or rooms
2. **Filter by Category**: Click on category buttons to filter by substitution type
3. **Combined Filters**: Use both search and categories together for precise results
4. **Clear Filters**: Click the "Clear" button to reset all filters

#### Theme Customization
1. Click the theme toggle button in the header (sun/moon icon)
2. Cycle through Light → Dark → System modes
3. Your preference is saved automatically

#### Mobile Navigation
1. Tap the hamburger menu icon in the top-left corner
2. Access the calendar and theme settings from the slide-out menu

### For Developers

#### Project Structure
```
fds-vertretungsplan/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes (WebUntis proxy)
│   │   ├── datenschutz/       # Privacy policy page
│   │   ├── impressum/         # Legal notice page
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── layout/           # Header, mobile menu
│   │   ├── ui/               # Reusable UI components (ShadCN)
│   │   ├── calendar-widget.tsx
│   │   ├── category-filters.tsx
│   │   ├── search-input.tsx
│   │   ├── substitution-card.tsx
│   │   ├── substitution-list.tsx
│   │   ├── theme-toggle.tsx
│   │   └── welcome-overlay.tsx
│   ├── hooks/                 # Custom React hooks
│   │   └── use-substitutions.ts
│   ├── lib/                   # Utility functions
│   │   ├── config.ts          # App configuration
│   │   ├── data-processing.ts # Data transformation
│   │   └── utils.ts           # Helper functions
│   ├── providers/             # React context providers
│   │   └── theme-provider.tsx
│   ├── services/              # External services
│   │   └── api.ts             # WebUntis API client
│   └── types/                 # TypeScript type definitions
│       └── index.ts
├── public/                    # Static assets
├── .env.local                 # Environment variables (not in git)
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Project dependencies
```

#### Key Files & Their Purpose

**`src/app/api/substitutions/route.ts`**
- Server-side API route that proxies requests to WebUntis
- Handles authentication, error handling, and response formatting
- Supports date-based queries with `?date=YYYYMMDD` parameter

**`src/hooks/use-substitutions.ts`**
- Custom hook for fetching and caching substitution data
- Implements 5-minute in-memory cache
- Provides loading states, error handling, and refetch functionality

**`src/lib/data-processing.ts`**
- Transforms WebUntis API responses into app-friendly format
- Parses HTML entities and extracts substitution types
- Implements sorting and filtering logic

**`src/types/index.ts`**
- Comprehensive TypeScript interfaces for all data structures
- Includes WebUntis API types and internal app types

#### Adding New Features

##### Example: Adding a New Substitution Type

1. **Update the type definition** in `src/types/index.ts`:
   ```typescript
   export type SubstitutionType = 
     | 'Entfall'
     | 'Raumänderung'
     // ... existing types
     | 'YourNewType';
   ```

2. **Add type detection** in `src/lib/data-processing.ts`:
   ```typescript
   const extractSubstitutionType = (data: string[], cellClasses: Record<string, string[]>): string => {
     // ... existing checks
     if (typeText.includes('YourNewType')) {
       return 'YourNewType';
     }
     // ...
   };
   ```

3. **Add priority** for sorting:
   ```typescript
   const SUBSTITUTION_PRIORITY: Record<string, number> = {
     // ... existing types
     'YourNewType': 9,
   };
   ```

##### Example: Customizing the Theme

1. **Edit CSS variables** in `src/app/globals.css`:
   ```css
   :root {
     --color-primary: your-color-values;
     /* ... */
   }
   ```

2. **Colors are defined using RGB values** for opacity support:
   ```css
   --color-primary: 33 128 149; /* #218095 */
   ```
   
   Used as: `rgb(var(--color-primary))` or `rgb(var(--color-primary)/0.5)` for 50% opacity

#### Testing the API Integration

Test the API endpoint directly:
```bash
# Get substitutions for today
curl http://localhost:3000/api/substitutions

# Get substitutions for a specific date
curl http://localhost:3000/api/substitutions?date=20250515
```

#### Extending the Calendar Widget

The calendar widget (`src/components/calendar-widget.tsx`) uses `react-day-picker`. To customize:
- Modify the `classNames` prop for styling
- Adjust `modifiers` for highlighting specific dates
- Add custom date ranges or disabled dates

#### Running Linting & Type Checking

```bash
# Run ESLint
npm run lint

# Type check with TypeScript
npx tsc --noEmit
```

---

## 🤝 Contributing

We welcome contributions! Whether you're fixing bugs, improving documentation, or adding new features, your help is appreciated.

### Development Workflow

1. **Fork the repository** on GitHub
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** with clear, descriptive commits
4. **Test thoroughly** on different screen sizes and browsers
5. **Ensure code quality**:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
6. **Submit a pull request** with a clear description of changes

### Code Style Guidelines

- Use **TypeScript** for all new code
- Follow the existing **component structure** and naming conventions
- Write **meaningful comments** for complex logic
- Keep **functions small and focused** (single responsibility principle)
- Use **descriptive variable names** (avoid abbreviations)
- Leverage **custom hooks** for reusable logic
- Ensure **responsive design** works on mobile, tablet, and desktop

### Commit Message Guidelines

- Use clear, descriptive commit messages
- Start with a verb: "Add", "Fix", "Update", "Remove", "Refactor"
- Reference issue numbers when applicable: "Fix #123: ..."

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2025 Lukas**

You are free to:
- ✅ Use this software commercially
- ✅ Modify and distribute
- ✅ Use privately
- ✅ Sublicense

With the conditions:
- 📝 Include the original copyright notice
- 📝 Include the license text

---

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Vercel**: For hosting and deployment platform
- **ShadCN**: For the beautiful component library
- **WebUntis**: For providing the substitution data API
- **Friedrich-Dessauer-Schule Limburg**: For inspiring this project
- **Open Source Community**: For the incredible tools and libraries

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/cancel-cloud/fds-vertretungsplan/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cancel-cloud/fds-vertretungsplan/discussions)

---

## 🗺️ Roadmap

See [TODO.md](TODO.md) for a detailed list of completed features and planned improvements.

### Upcoming Features
- ⏳ Advanced client-side caching system
- ⏳ Smart search with similarity matching
- ⏳ Accessibility improvements (WCAG 2.1 AA compliance)
- ⏳ Performance optimizations
- ⏳ Multi-language support
- ⏳ Push notifications for changes

---

## 📊 Project Statistics

- **Lines of Code**: ~3,000+
- **Components**: 20+
- **Pages**: 3 (Home, Impressum, Datenschutz)
- **API Routes**: 1 (Substitutions)
- **Dependencies**: Carefully selected for quality and performance
- **Version**: 0.2.0

---

Made with ❤️ for the Friedrich-Dessauer-Schule community
