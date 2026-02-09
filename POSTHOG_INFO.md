# PostHog Info (fds-vertretungsplan)

Last verified: 2026-02-09 (Europe/Berlin)

## Project + Dashboards

- PostHog project: `88047` (EU)
- Default dashboard: `245924` (`FDS-Substitution`)
- Improved dashboard: `517819` (`FDS-Substitution improvement`)

### Default dashboard (`245924`) tiles

- Daily active users (DAUs)
- Weekly active users (WAUs)
- Growth accounting
- Retention
- Referring domain (last 14 days)
- Pageview funnel, by browser

### Improved dashboard (`517819`) tiles

- Today unique substitution viewers
- API Requests by Outcome (daily)
- API Error Rate (%)
- API Latency p95 (ms)
- Rate Limit Trend
- Cache Hit Ratio (%)
- Client Fetch Lifecycle
- Client Fetch Latency p95 (ms)
- Result Size Trend
- Search Usage (has query)
- Filter Interaction
- Date Navigation Sources
- UI Variant Exposure
- Retry Clicked by UI Location
- Engagement Controls

## Environment Variables

Client-side:

- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST` (optional, defaults to `https://eu.i.posthog.com` in middleware usage)

Server-side:

- `POSTHOG_API_KEY` (required for server event capture)
- `POSTHOG_HOST` (optional, defaults to `https://eu.i.posthog.com`)

Important:

- Do not commit `.env.local`.
- Do not upload `.env.local` as a public/static file.
- Configure these values as environment variables in your hosting provider.

## Current Tracking (Events)

Source of truth:

- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/lib/analytics/events.ts`
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/lib/analytics/posthog-client.ts`
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/lib/analytics/posthog-server.ts`
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/api/substitutions/route.ts`
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/page.tsx`
- `/Users/cancelcloud/Developer/personal/fds-vertretungsplan/src/app/newui/page.tsx`

### Client events

- `ui_variant_exposed`
  - Properties: `variant`, `source`
- `search_updated`
  - Properties: `query_length`, `has_query`, `location`
- `category_toggled`
  - Properties: `category`, `selected_count`, `location`
- `filters_cleared`
  - Properties: `scope`, `location`
- `date_selected`
  - Properties: `source`, `day_of_week`, `timestamp`
- `retry_clicked`
  - Properties: `location`
- `mobile_menu_toggled`
  - Properties: `open`, optional `location`, optional `source`
- `theme_changed`
  - Properties: `theme`
- `welcome_overlay_shown`
  - Properties: `source`
- `welcome_overlay_dismissed`
  - Properties: `source`
- `substitutions_fetch_started`
  - Properties: `date`, `source`
- `substitutions_fetch_success`
  - Properties: `source`, optional `date`, `result_count`, `duration_ms`
- `substitutions_fetch_meta`
  - Properties: `date`, `duration_ms`
- `substitutions_fetch_error`
  - Properties: `date`, `duration_ms`, `message_length`

### Server events

- `api_substitutions_rate_limited`
  - Properties: `retry_after_seconds`, `ip_hash_source`
- `api_substitutions_cache_hit`
  - Properties: `date`, `duration_ms`
- `api_substitutions_success`
  - Properties: `date`, `row_count`, `duration_ms`
- `api_substitutions_meta`
  - Properties: `date`, `duration_ms`
- `api_substitutions_error`
  - Properties: `duration_ms`, `message_length`

## Feature Flags currently read in code

- `ui.new_homepage`
- `ui.welcome_overlay`
- `ui.advanced_calendar`
- `analytics.debug_mode`
- `analytics.client_capture_sample_rate`

Project flag list currently returns none (`feature-flag-get-all` was empty), so these keys should be created in PostHog if you want managed flag values.

## Unique User Metrics

You can track unique viewers of the substitution plan via:

- Event: `substitutions_fetch_success`
- Metric type: unique users (DAU)
- Existing insight: `Today unique substitution viewers` (`short_id: 2L51cY84`)

Direct link:

- https://eu.posthog.com/project/88047/insights/2L51cY84

For iPhone app "Hog Stats": if custom filters are limited, open this dedicated insight/dashboard tile instead of building filters in-app.

## What you can ask in future chats

- "How many unique users viewed substitutions today?"
- "Show API error rate for the last 7 days."
- "Compare newui vs legacy exposure."
- "How often are filters/search/date navigation used?"
- "What is p95 latency for API/client fetch?"
- "How many requests were cache hits or rate-limited?"
