const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
};

const uint8ArrayToBase64Url = (value: Uint8Array): string => {
  let binary = '';
  for (let index = 0; index < value.length; index += 1) {
    binary += String.fromCharCode(value[index]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const normalizeBase64Url = (value: string): string => value.replace(/=+$/g, '').trim();

async function parseJsonSafe(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

const hasMatchingApplicationServerKey = (subscription: PushSubscription, vapidPublicKey: string): boolean => {
  const serverKeyBuffer = subscription.options?.applicationServerKey;
  if (!serverKeyBuffer) {
    return true;
  }

  const currentKey = uint8ArrayToBase64Url(new Uint8Array(serverKeyBuffer));
  return normalizeBase64Url(currentKey) === normalizeBase64Url(vapidPublicKey);
};

const loadVapidPublicKey = async (): Promise<string> => {
  const keyResponse = await fetch('/api/push/subscribe');
  const keyData = await parseJsonSafe(keyResponse);
  const vapidPublicKey = typeof keyData.vapidPublicKey === 'string' ? keyData.vapidPublicKey : null;
  if (!keyResponse.ok || !vapidPublicKey) {
    const errorMessage =
      typeof keyData.error === 'string' && keyData.error.length > 0
        ? keyData.error
        : `Push ist aktuell nicht verfügbar (HTTP ${keyResponse.status}).`;
    throw new Error(errorMessage);
  }

  return vapidPublicKey;
};

export const isPushSupported = (): boolean =>
  window.isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export const ensureServiceWorkerReady = async (): Promise<ServiceWorkerRegistration> => {
  await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  return navigator.serviceWorker.ready;
};

export const getExistingPushSubscription = async (): Promise<PushSubscription | null> => {
  if (!isPushSupported()) {
    return null;
  }

  try {
    const registration = await ensureServiceWorkerReady();
    return registration.pushManager.getSubscription();
  } catch {
    return null;
  }
};

export const getExistingPushEndpoint = async (): Promise<string | null> => {
  const subscription = await getExistingPushSubscription();
  return subscription?.endpoint ?? null;
};

export const ensureCurrentSubscription = async (): Promise<PushSubscription> => {
  const registration = await ensureServiceWorkerReady();
  const vapidPublicKey = await loadVapidPublicKey();
  const vapidServerKey = urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource;

  let subscription = await registration.pushManager.getSubscription();
  if (subscription && !hasMatchingApplicationServerKey(subscription, vapidPublicKey)) {
    await fetch('/api/push/unsubscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    await subscription.unsubscribe();
    subscription = null;
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidServerKey,
    });
  }

  return subscription;
};

export const persistPushSubscription = async (subscription: PushSubscription): Promise<void> => {
  const subscribeResponse = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });

  const subscribeData = await parseJsonSafe(subscribeResponse);
  if (!subscribeResponse.ok) {
    const errorMessage =
      typeof subscribeData.error === 'string' && subscribeData.error.length > 0
        ? subscribeData.error
        : `Push konnte nicht aktiviert werden (HTTP ${subscribeResponse.status}).`;
    throw new Error(errorMessage);
  }
};

export const ensureNotificationPermission = async (): Promise<{ ok: boolean; reason?: string }> => {
  if (!window.isSecureContext) {
    return { ok: false, reason: 'insecure_context' };
  }

  if (!('Notification' in window)) {
    return { ok: false, reason: 'notification_api_unavailable' };
  }

  if (Notification.permission === 'granted') {
    return { ok: true };
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return { ok: true };
    }

    if (permission === 'default') {
      return { ok: false, reason: 'permission_prompt_not_confirmed' };
    }
  }

  return { ok: false, reason: 'permission_denied' };
};
