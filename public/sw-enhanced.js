const CACHE_NAME = 'sentinela-v2';
const STATIC_CACHE = 'sentinela-static-v2';
const DYNAMIC_CACHE = 'sentinela-dynamic-v2';
const API_CACHE = 'sentinela-api-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
];

const API_PATTERNS = [
  /\/rest\/v1\//,
  /\/functions\/v1\//,
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => ![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(key))
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// Fetch event with strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests: Network first, then cache
  if (API_PATTERNS.some(p => p.test(url.pathname))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(API_CACHE).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: Cache first
  if (request.destination === 'image' || request.destination === 'font' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, response.clone()));
        return response;
      }))
    );
    return;
  }

  // HTML: Network first
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request).then(cached => cached || caches.match('/offline.html')))
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'Sentinela', body: 'New notification' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: data.actions || []
    })
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  const cache = await caches.open('pending-sync');
  const requests = await cache.keys();
  await Promise.all(requests.map(async (request) => {
    const response = await cache.match(request);
    if (response) {
      const data = await response.json();
      await fetch(request, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
      await cache.delete(request);
    }
  }));
}

// Message handling
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
