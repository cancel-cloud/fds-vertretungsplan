import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: '/x7k9m2',
    ui_host: 'https://eu.posthog.com',
    person_profiles: 'identified_only',
    defaults: '2025-05-24',
    capture_exceptions: true,
    capture_pageview: true,
    autocapture: true,
    persistence: 'localStorage+cookie',
    debug: process.env.NODE_ENV === 'development',
  });
}
