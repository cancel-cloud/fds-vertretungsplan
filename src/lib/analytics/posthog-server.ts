import { PostHog } from 'posthog-node';
import { AnalyticsProperties, ServerAnalyticsEvent } from '@/lib/analytics/events';

let client: PostHog | null | undefined;
let warnedMissingKey = false;

const getClient = (): PostHog | null => {
  if (client !== undefined) {
    return client;
  }

  const apiKey = process.env.POSTHOG_API_KEY?.trim();
  if (!apiKey) {
    if (!warnedMissingKey) {
      warnedMissingKey = true;
      console.warn('POSTHOG_API_KEY not configured. Server-side analytics capture is disabled.');
    }
    client = null;
    return null;
  }

  client = new PostHog(apiKey, {
    host: process.env.POSTHOG_HOST?.trim() || 'https://eu.i.posthog.com',
    flushAt: 1,
    flushInterval: 0,
  });

  return client;
};

export const captureServerEvent = async (
  event: ServerAnalyticsEvent,
  distinctId: string,
  properties: AnalyticsProperties = {}
): Promise<void> => {
  const analyticsClient = getClient();
  if (!analyticsClient) {
    return;
  }

  try {
    await analyticsClient.capture({
      event,
      distinctId,
      properties,
    });
  } catch (error) {
    console.warn('Failed to capture server analytics event', { event, error });
  }
};
