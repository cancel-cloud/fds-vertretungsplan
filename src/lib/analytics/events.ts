export const ANALYTICS_EVENTS = {
  UI_VARIANT_EXPOSED: 'ui_variant_exposed',
  SEARCH_UPDATED: 'search_updated',
  CATEGORY_TOGGLED: 'category_toggled',
  FILTERS_CLEARED: 'filters_cleared',
  DATE_SELECTED: 'date_selected',
  RETRY_CLICKED: 'retry_clicked',
  MOBILE_MENU_TOGGLED: 'mobile_menu_toggled',
  THEME_CHANGED: 'theme_changed',
  WELCOME_SHOWN: 'welcome_overlay_shown',
  WELCOME_DISMISSED: 'welcome_overlay_dismissed',
  SUBSTITUTIONS_FETCH_STARTED: 'substitutions_fetch_started',
  SUBSTITUTIONS_FETCH_SUCCESS: 'substitutions_fetch_success',
  SUBSTITUTIONS_FETCH_ERROR: 'substitutions_fetch_error',
  SUBSTITUTIONS_FETCH_META: 'substitutions_fetch_meta',
  API_SUBSTITUTIONS_RATE_LIMITED: 'api_substitutions_rate_limited',
  API_SUBSTITUTIONS_CACHE_HIT: 'api_substitutions_cache_hit',
  API_SUBSTITUTIONS_SUCCESS: 'api_substitutions_success',
  API_SUBSTITUTIONS_META: 'api_substitutions_meta',
  API_SUBSTITUTIONS_ERROR: 'api_substitutions_error',
} as const;

export type ClientAnalyticsEvent =
  | (typeof ANALYTICS_EVENTS)[
      | 'UI_VARIANT_EXPOSED'
      | 'SEARCH_UPDATED'
      | 'CATEGORY_TOGGLED'
      | 'FILTERS_CLEARED'
      | 'DATE_SELECTED'
      | 'RETRY_CLICKED'
      | 'MOBILE_MENU_TOGGLED'
      | 'THEME_CHANGED'
      | 'WELCOME_SHOWN'
      | 'WELCOME_DISMISSED'
      | 'SUBSTITUTIONS_FETCH_STARTED'
      | 'SUBSTITUTIONS_FETCH_SUCCESS'
      | 'SUBSTITUTIONS_FETCH_ERROR'
      | 'SUBSTITUTIONS_FETCH_META'];

export type ServerAnalyticsEvent =
  | (typeof ANALYTICS_EVENTS)[
      | 'API_SUBSTITUTIONS_RATE_LIMITED'
      | 'API_SUBSTITUTIONS_CACHE_HIT'
      | 'API_SUBSTITUTIONS_SUCCESS'
      | 'API_SUBSTITUTIONS_META'
      | 'API_SUBSTITUTIONS_ERROR'];

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export const redactSearch = (query: string) => ({
  query_length: query.trim().length,
  has_query: query.trim().length > 0,
});
