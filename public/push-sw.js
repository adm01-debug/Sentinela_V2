/* global self, URL */

// Service worker dedicado ao Web Push.
//
// Sem handler de `fetch` de proposito: um cache-first aqui (como o sw.js antigo)
// serviria HTML antigo e quebraria o app publicado.

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Sentinela";
  const data = payload.data && typeof payload.data === "object" ? payload.data : {};

  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "",
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: payload.tag,
      data: Object.assign({ url: payload.url || "/" }, data),
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const rawUrl = (event.notification.data && event.notification.data.url) || "/";
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      return undefined;
    })
  );
});
