/* Bhuk Foods service worker — Web Push + minimal PWA install shell.
 *
 * Push payload shape (JSON in event.data):
 *   { title: string, body: string, url?: string, tag?: string }
 */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Bhuk Foods", body: event.data.text() };
  }
  const title = payload.title || "Bhuk Foods";
  const options = {
    body: payload.body || "",
    tag: payload.tag,
    data: { url: payload.url || "/" },
    badge: "/icon-mono-72.png",
    icon: "/icon-192.png",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const c of wins) {
        if ("focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
