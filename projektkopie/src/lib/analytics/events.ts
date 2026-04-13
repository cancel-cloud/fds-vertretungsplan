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
  APPLE_PROMO_IMPRESSION: 'apple_promo_impression',
  APPLE_PROMO_EXPANDED: 'apple_promo_expanded',
  APPLE_PROMO_DISMISSED: 'apple_promo_dismissed',
  APPLE_PROMO_SHARE_CLICKED: 'apple_promo_share_clicked',
  APPLE_PROMO_SHARE_NATIVE_SUCCESS: 'apple_promo_share_native_success',
  APPLE_PROMO_SHARE_COPY_FALLBACK: 'apple_promo_share_copy_fallback',
  APPLE_PROMO_MOBILE_POST_SHARE_SHOWN: 'apple_promo_mobile_post_share_shown',
  APPLE_PROMO_PUSH_ENABLE_CLICKED: 'apple_promo_push_enable_clicked',
  APPLE_PROMO_PUSH_ENABLE_SUCCESS: 'apple_promo_push_enable_success',
  APPLE_PROMO_PUSH_ENABLE_FAILED: 'apple_promo_push_enable_failed',
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
      | 'SUBSTITUTIONS_FETCH_META'
      | 'APPLE_PROMO_IMPRESSION'
      | 'APPLE_PROMO_EXPANDED'
      | 'APPLE_PROMO_DISMISSED'
      | 'APPLE_PROMO_SHARE_CLICKED'
      | 'APPLE_PROMO_SHARE_NATIVE_SUCCESS'
      | 'APPLE_PROMO_SHARE_COPY_FALLBACK'
      | 'APPLE_PROMO_MOBILE_POST_SHARE_SHOWN'
      | 'APPLE_PROMO_PUSH_ENABLE_CLICKED'
      | 'APPLE_PROMO_PUSH_ENABLE_SUCCESS'
      | 'APPLE_PROMO_PUSH_ENABLE_FAILED'];

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
