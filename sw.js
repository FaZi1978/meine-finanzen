// Service Worker für „Meine Finanzen“: macht die App installierbar und offline nutzbar.
// Strategie: zuerst aus dem Netz laden (damit Updates sofort ankommen), ohne Netz aus dem Zwischenspeicher.
// Es werden nur die App-Dateien gespeichert – deine Finanzdaten liegen verschlüsselt im Browser-Speicher, nicht hier.
const CACHE = 'meine-finanzen-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;  // fremde Seiten (z. B. Vergleichsportale) nicht anfassen
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html')))
  );
});
