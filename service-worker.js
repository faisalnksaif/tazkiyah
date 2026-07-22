const CACHE_NAME = "tazkiyah-pwa-1784757792532";
const PRECACHE_URLS = [
  "/tazkiyah/",
  "/tazkiyah/_expo/static/js/web/AppEntry-bc9de843ec1ddb079b60114621063da6.js",
  "/tazkiyah/assets/node_modules/@react-navigation/elements/lib/module/assets/back-icon-mask.5223c8d9b0d08b82a5670fb5f71faf78.png",
  "/tazkiyah/assets/node_modules/@react-navigation/elements/lib/module/assets/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png",
  "/tazkiyah/icons/icon-180.png",
  "/tazkiyah/icons/icon-192.png",
  "/tazkiyah/icons/icon-512.png",
  "/tazkiyah/index.html",
  "/tazkiyah/manifest.webmanifest",
  "/tazkiyah/metadata.json"
];
const BASE_PATH = "/tazkiyah";
const EXPO_PATH = BASE_PATH + '/_expo/';
const ASSETS_PATH = BASE_PATH + '/assets/';
const ICONS_PATH = BASE_PATH + '/icons/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isStaticAsset =
    url.pathname.startsWith(EXPO_PATH) ||
    url.pathname.startsWith(ASSETS_PATH) ||
    url.pathname.startsWith(ICONS_PATH);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      }))
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/tazkiyah/index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Tazkiyah Reminder', body: event.data.text() };
  }

  const title = payload.title || 'Tazkiyah Reminder';
  const options = {
    body: payload.body || '',
    icon: payload.icon || (BASE_PATH + '/icons/icon-192.png'),
    badge: payload.badge || (BASE_PATH + '/icons/icon-192.png'),
    tag: payload.tag || 'tazkiyah-reminder',
    data: payload.data || { url: BASE_PATH + '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || (BASE_PATH + '/');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(BASE_PATH) && 'focus' in client) {
          client.postMessage({ type: 'push-click', url: targetUrl });
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
      return undefined;
    })
  );
});
