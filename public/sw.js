self.addEventListener('install', () => {
  console.log('[SW] installing, calling skipWaiting');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] activating, claiming clients');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('[SW] push event received, has data:', Boolean(event.data));

  let payload = {
    title: 'FDS Stundenplan',
    body: 'Neue Benachrichtigung erhalten.',
    url: '/stundenplan/dashboard',
    traceId: null,
  };

  try {
    if (event.data) {
      payload = event.data.json();
      console.log('[SW] parsed payload:', JSON.stringify(payload));
    }
  } catch {
    payload = {
      title: 'FDS Stundenplan',
      body: event.data ? event.data.text() : 'Neue Benachrichtigung erhalten.',
      url: '/stundenplan/dashboard',
    };
    console.log('[SW] failed to parse JSON, using text fallback');
  }

  const title = payload.title || 'FDS Stundenplan';
  const body = payload.body || 'Es gibt neue Änderungen in deinem Stundenplan.';
  const url = payload.url || '/stundenplan/dashboard';
  const tag = payload.tag || `fds-push-${Date.now()}`;
  const traceId = payload.traceId || null;

  console.log('[SW] showing notification:', title, '| tag:', tag, '| traceId:', traceId);

  const notifyPromise = self.registration
    .showNotification(title, {
      body,
      data: {
        url,
        traceId,
        receivedAt: Date.now(),
      },
      tag,
      renotify: tag.startsWith('fds-test-'),
    })
    .then(() => {
      console.log('[SW] showNotification succeeded');
    })
    .catch((error) => {
      console.error('[SW] showNotification failed:', error);
      return clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          client.postMessage({
            type: 'push-notification-error',
            traceId,
            message: error instanceof Error ? error.message : 'showNotification failed',
            receivedAt: Date.now(),
          });
        }
      });
    });

  const broadcastPromise = clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    console.log('[SW] broadcasting push-received to', clientList.length, 'client(s)');
    for (const client of clientList) {
      client.postMessage({
        type: 'push-received',
        payload: { title, body, url, hasData: Boolean(event.data), traceId },
        receivedAt: Date.now(),
      });
    }
  });

  event.waitUntil(Promise.all([notifyPromise, broadcastPromise]));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/stundenplan/dashboard?fromPush=1';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }

        return undefined;
      })
  );
});
