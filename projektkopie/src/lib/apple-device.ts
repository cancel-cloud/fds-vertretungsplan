const IOS_DEVICE_REGEX = /\b(iPhone|iPad|iPod)\b/i;
const MACINTOSH_REGEX = /\bMacintosh\b/i;
const MOBILE_DEVICE_REGEX = /\b(Android|Mobile|iPhone|iPad|iPod)\b/i;
const EDGE_REGEX = /\b(EdgA?|EdgiOS)\b/i;
const FIREFOX_REGEX = /\b(Firefox|FxiOS)\b/i;
const CHROME_REGEX = /\b(Chrome|CriOS|Chromium)\b/i;
const SAFARI_REGEX = /\bSafari\b/i;

export type PushPromoPlatformState = 'desktop_supported' | 'mobile_browser' | 'mobile_standalone' | 'unsupported';

const getUserAgent = (): string => navigator.userAgent;
const getTouchPoints = (): number => navigator.maxTouchPoints ?? 0;

export const isAppleMobileDevice = (
  userAgent: string = getUserAgent(),
  maxTouchPoints: number = getTouchPoints()
): boolean => IOS_DEVICE_REGEX.test(userAgent) || (MACINTOSH_REGEX.test(userAgent) && maxTouchPoints > 1);

export const isLikelyMobileDevice = (
  userAgent: string = getUserAgent(),
  maxTouchPoints: number = getTouchPoints()
): boolean => MOBILE_DEVICE_REGEX.test(userAgent) || (MACINTOSH_REGEX.test(userAgent) && maxTouchPoints > 1);

export const getBrowserDisplayName = (userAgent: string = getUserAgent()): string => {
  if (EDGE_REGEX.test(userAgent)) {
    return 'Edge';
  }
  if (FIREFOX_REGEX.test(userAgent)) {
    return 'Firefox';
  }
  if (CHROME_REGEX.test(userAgent)) {
    return 'Chrome';
  }
  if (SAFARI_REGEX.test(userAgent) && !CHROME_REGEX.test(userAgent) && !EDGE_REGEX.test(userAgent)) {
    return 'Safari';
  }
  return 'Unknown Browser';
};

export const isStandaloneDisplayMode = (): boolean => {
  const nav = navigator as Navigator & { standalone?: boolean };
  const standaloneByNavigator = nav.standalone === true;
  const standaloneByMedia = typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches;
  return standaloneByNavigator || standaloneByMedia;
};

export const hasWebPushSupport = (
  isSecureContextValue: boolean = window.isSecureContext,
  hasServiceWorker: boolean = 'serviceWorker' in navigator,
  hasPushManager: boolean = 'PushManager' in window,
  hasNotification: boolean = 'Notification' in window
): boolean => isSecureContextValue && hasServiceWorker && hasPushManager && hasNotification;

export const resolvePushPromoPlatformState = (options: {
  userAgent: string;
  maxTouchPoints: number;
  isSecureContextValue: boolean;
  hasServiceWorker: boolean;
  hasPushManager: boolean;
  hasNotification: boolean;
  standalone: boolean;
}): PushPromoPlatformState => {
  if (
    !hasWebPushSupport(
      options.isSecureContextValue,
      options.hasServiceWorker,
      options.hasPushManager,
      options.hasNotification
    )
  ) {
    return 'unsupported';
  }

  if (isLikelyMobileDevice(options.userAgent, options.maxTouchPoints)) {
    return options.standalone ? 'mobile_standalone' : 'mobile_browser';
  }

  return 'desktop_supported';
};

export const getPushPromoPlatformState = (): PushPromoPlatformState =>
  resolvePushPromoPlatformState({
    userAgent: getUserAgent(),
    maxTouchPoints: getTouchPoints(),
    isSecureContextValue: window.isSecureContext,
    hasServiceWorker: 'serviceWorker' in navigator,
    hasPushManager: 'PushManager' in window,
    hasNotification: 'Notification' in window,
    standalone: isStandaloneDisplayMode(),
  });

// Kept for compatibility with existing call sites/tests.
export const isEligibleForApplePushPromo = (): boolean => getPushPromoPlatformState() !== 'unsupported';
