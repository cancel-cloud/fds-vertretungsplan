# Vertretungsplan Next.js Conversion TODO

## Core Setup
- [x] Setup TailwindCSS design system with CSS variables (theme colors, spacing, typography)
- [x] Install and configure ShadCN/UI components
- [x] Setup project structure and folders
- [x] Configure TypeScript interfaces for data types

## Theme Management
- [x] Implement theme provider (light/dark/system modes)
- [x] Create theme toggle component with cycling functionality
- [x] Setup CSS variables for theme switching
- [x] Store theme preference in session storage

## Layout & Navigation
- [x] Create app layout with header and main content
- [x] Implement responsive header with title and navigation
- [x] Create mobile menu overlay with slide animation
- [x] Add navigation links (Impressum, Datenschutz)
- [x] Make title clickable to return to main view

## Calendar Widget
- [x] Create calendar component with month navigation
- [x] Implement date selection functionality
- [x] Show current date and selected date highlighting
- [x] Handle previous/next month navigation
- [x] Support clicking on adjacent month dates
- [x] Make calendar responsive (desktop sidebar + mobile menu)

## API Integration (Basic)
- [x] Create TypeScript interfaces for WebUntis API request/response
- [x] Implement API service for fetching substitution data
- [x] Add error handling for API requests (network, auth, rate limiting)
- [x] Implement date formatting for API requests (YYYYMMDD format)
- [x] Handle HTML parsing in API responses (substMonitorSubstElem, cancelStyle)
- [x] Add loading states for API calls
- [x] Implement retry logic for failed requests
- [x] Add environment configuration for API endpoints

## Real API Implementation & Authentication
- [x] Setup environment variables for WebUntis credentials
  - [x] Add WEBUNTIS_SCHOOL_NAME to .env.local
  - [x] Add WEBUNTIS_BASE_URL to .env.local
- [x] Implement session management for WebUntis cookies
  - [x] Create session storage service for Tenant-Id and schoolname cookies
  - [x] Implement JSESSIONID handling and renewal
  - [x] Add session expiration detection and refresh logic
  - [x] Handle traceId generation and management
- [x] Enhance API request builder
  - [x] Build dynamic headers with proper cookies
  - [x] Implement request payload builder with configurable options
  - [x] Add school-specific URL generation
  - [x] Handle date range requests (today, tomorrow, custom dates)
- [x] Add API request validation
  - [x] Validate date formats before sending requests
  - [x] Check for required authentication data
  - [x] Add request sanitization and security checks
- [x] Implement real-time data fetching
  - [x] Create data fetching hooks for different views
  - [x] Add automatic refresh on date changes
  - [x] Implement background refresh for current day data
  - [x] Handle API rate limiting and request throttling

## Client-Side Caching System
- [ ] Design caching architecture
  - [ ] Choose caching strategy (React Query, SWR, or custom)
  - [ ] Define cache key structure (date-based, school-based)
  - [ ] Set cache expiration policies (per data type)
  - [ ] Plan cache invalidation strategies
- [ ] Implement core caching service
  - [ ] Create cache storage abstraction (localStorage + memory)
  - [ ] Add cache key generation utilities
  - [ ] Implement cache hit/miss tracking
  - [ ] Add cache size management and cleanup
- [ ] Build cache-aware API layer
  - [ ] Create cached API request wrapper
  - [ ] Implement stale-while-revalidate pattern
  - [ ] Add background cache refresh
  - [ ] Handle offline/online state changes
- [ ] Add data freshness management
  - [ ] Implement last-updated timestamps
  - [ ] Create cache invalidation triggers
  - [ ] Add manual refresh functionality
  - [ ] Handle server-side data updates detection
- [ ] Optimize cache performance
  - [ ] Implement cache preloading for likely-needed dates
  - [ ] Add cache compression for large datasets
  - [ ] Create cache warming strategies
  - [ ] Add cache hit ratio monitoring
- [ ] Handle cache edge cases
  - [ ] Manage cache during school holidays
  - [ ] Handle timezone changes and DST
  - [ ] Add cache migration for app updates
  - [ ] Implement graceful fallback when cache fails

## Data Processing & Transformation
- [ ] Enhance response data parsing
  - [ ] Parse HTML entities in teacher/room names
  - [ ] Extract and normalize subject abbreviations
  - [ ] Handle special substitution types (Entfall, Raumänderung, etc.)
  - [ ] Parse time ranges and convert to app format
- [ ] Implement data normalization
  - [ ] Standardize class name formats
  - [ ] Normalize teacher abbreviations
  - [ ] Handle room number formats consistently
  - [ ] Create unified substitution type mapping
- [ ] Add data validation and sanitization
  - [ ] Validate API response structure
  - [ ] Sanitize HTML content safely
  - [ ] Check for malformed data and handle gracefully
  - [ ] Add data completeness verification
- [ ] Create data aggregation utilities
  - [ ] Group substitutions by class/teacher/subject
  - [ ] Calculate statistics (total substitutions, by type)
  - [ ] Generate daily/weekly summaries
  - [ ] Create affected elements tracking

## Data Management
- [x] Create TypeScript interfaces for substitution data
- [x] Setup sample data structure (substitutions and categories)
- [x] Implement data processing and filtering logic
- [x] Parse API response data into app format
- [x] Handle special characters and HTML entities in API data
- [x] Implement data caching strategy

## Substitution Management
- [x] Create substitution cards with proper styling
- [x] Implement loading states with skeleton cards
- [x] Add error state with retry functionality
- [x] Create "no results" state
- [x] Sort substitutions by priority (Entfall first, then by hour)

## Search & Filtering
- [x] Implement search input with icon
- [x] Create category filter buttons with color indicators
- [x] Add search results counter
- [x] Implement real-time filtering (search + categories combined)
- [x] Sync search between desktop and mobile

## Category System
- [x] Create category filter components
- [x] Implement category color indicators
- [x] Add active/inactive filter states
- [x] Map substitution types to visual styles (border colors)

## Legal Pages
- [x] Create Impressum page with enhanced card layout
- [x] Create Datenschutz page with enhanced card layout
- [x] Implement navigation between main view and legal pages
- [x] Add back button functionality
- [x] Style legal content cards with icons

## Welcome Experience
- [x] Create welcome overlay component
- [x] Implement confetti animation on first visit
- [x] Add session storage to track welcome status
- [x] Create dismissible welcome message

## Interactive Features
- [x] Add loading spinners for button states
- [x] Implement hover effects and transitions
- [ ] Add focus management for accessibility
- [x] Create smooth animations and transitions

## Responsive Design
- [x] Desktop layout with sidebar and main content
- [x] Mobile layout with hamburger menu
- [x] Responsive grid layouts for substitution cards
- [x] Mobile-optimized calendar and filters
- [x] Responsive legal page layouts

## Accessibility
- [ ] Add proper focus management
- [ ] Implement keyboard navigation
- [ ] Add ARIA labels and roles
- [ ] Ensure color contrast compliance
- [ ] Add screen reader support

## Error Handling & UX
- [x] Create error boundary components
- [x] Implement app-level error boundary with fallback UI
- [x] Add retry functionality to error states
- [x] Create loading hook for data fetching
- [x] Implement in-memory caching for API responses
- [x] Add proper error messages and user feedback

## Performance & Monitoring
- [ ] Add API performance monitoring
  - [ ] Track request/response times
  - [ ] Monitor cache hit rates
  - [ ] Log API errors and retry attempts
  - [ ] Add user interaction analytics
- [ ] Implement performance optimizations
  - [ ] Add request deduplication
  - [ ] Implement virtual scrolling for large datasets
  - [ ] Optimize re-renders with proper memoization
  - [ ] Add bundle size optimization

## Final Polish
- [x] Add proper error handling
- [x] Implement proper TypeScript types throughout
- [x] Add loading states for all async operations
- [ ] Optimize performance and bundle size
- [ ] Test all functionality across devices

## Testing & Cleanup
- [ ] Test theme switching
- [ ] Test calendar functionality
- [ ] Test search and filtering
- [ ] Test mobile menu and responsive design
- [ ] Test legal page navigation
- [ ] Test welcome overlay
- [ ] Test API integration with real WebUntis data
- [ ] Test caching behavior and invalidation
- [ ] Test offline/online state handling
- [ ] Final code cleanup and optimization 




# Smart Search for search
- [ ] Make seach item smart searchable so that i can search for exaple 10AKF and get all the information shown for the class 10A KF so simularity search