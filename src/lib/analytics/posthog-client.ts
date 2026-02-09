'use client';

import posthog from 'posthog-js';
import { AnalyticsProperties, ClientAnalyticsEvent } from '@/lib/analytics/events';

const DEFAULT_SAMPLE_RATE = 100;

const toSampleRate = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, value));
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return Math.min(100, Math.max(0, parsed));
    }
  }
  return DEFAULT_SAMPLE_RATE;
};

export const isPostHogConfigured = (): boolean =>
  Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

export const getBooleanFlag = (key: string, fallback = false): boolean => {
  const value = posthog.getFeatureFlag(key);

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'enabled') {
      return true;
    }
    if (normalized === 'false' || normalized === '0' || normalized === 'disabled') {
      return false;
    }
  }

  const enabled = posthog.isFeatureEnabled(key);
  return typeof enabled === 'boolean' ? enabled : fallback;
};

export const getNumericFlag = (key: string, fallback: number): number => {
  const value = posthog.getFeatureFlag(key);
  const parsed = toSampleRate(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const shouldCapture = (): boolean => {
  const sampleRate = getNumericFlag('analytics.client_capture_sample_rate', DEFAULT_SAMPLE_RATE);
  if (sampleRate >= 100) {
    return true;
  }
  if (sampleRate <= 0) {
    return false;
  }
  return Math.random() * 100 < sampleRate;
};

export const captureClientEvent = (
  event: ClientAnalyticsEvent,
  properties: AnalyticsProperties = {}
): void => {
  if (!isPostHogConfigured()) {
    return;
  }

  if (!shouldCapture()) {
    return;
  }

  posthog.capture(event, properties);
};

export const registerDeviceId = (deviceId: string): void => {
  if (!isPostHogConfigured()) {
    return;
  }

  posthog.identify(deviceId);
  posthog.register({ device_id: deviceId, app: 'fds-vertretungsplan' });
};
