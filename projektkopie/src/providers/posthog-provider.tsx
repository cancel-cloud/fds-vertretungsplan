'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import posthog from 'posthog-js';
import {
  captureClientEvent,
  getBooleanFlag,
  getNumericFlag,
  isPostHogConfigured,
  registerDeviceId,
} from '@/lib/analytics/posthog-client';
import { getDeviceId } from '@/lib/analytics/device-id';
import { AnalyticsProperties, ClientAnalyticsEvent } from '@/lib/analytics/events';

interface PostHogContextValue {
  deviceId: string | null;
  featureFlagsReady: boolean;
  capture: (event: ClientAnalyticsEvent, properties?: AnalyticsProperties) => void;
  isFeatureEnabled: (key: string, fallback?: boolean) => boolean;
  getFlagNumber: (key: string, fallback: number) => number;
}

const PostHogContext = createContext<PostHogContextValue | undefined>(undefined);

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [featureFlagsReady, setFeatureFlagsReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPostHogConfigured()) {
      return;
    }

    const currentDeviceId = getDeviceId();
    if (currentDeviceId) {
      setDeviceId(currentDeviceId);
      registerDeviceId(currentDeviceId);
    }

    posthog.reloadFeatureFlags();

    const unsubscribe = posthog.onFeatureFlags(() => {
      setFeatureFlagsReady(true);
      const debugEnabled = getBooleanFlag('analytics.debug_mode', false);
      posthog.set_config({
        debug: debugEnabled || process.env.NODE_ENV === 'development',
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value = useMemo<PostHogContextValue>(
    () => ({
      deviceId,
      featureFlagsReady,
      capture: (event, properties = {}) => {
        captureClientEvent(event, properties);
      },
      isFeatureEnabled: (key, fallback = false) => getBooleanFlag(key, fallback),
      getFlagNumber: (key, fallback) => getNumericFlag(key, fallback),
    }),
    [deviceId, featureFlagsReady]
  );

  return <PostHogContext.Provider value={value}>{children}</PostHogContext.Provider>;
}

export function usePostHogContext() {
  const context = useContext(PostHogContext);
  if (!context) {
    throw new Error('usePostHogContext must be used within PostHogProvider');
  }
  return context;
}
