// Minimal service worker — only exists to satisfy PWA installability criteria
// (a registered service worker with a fetch handler). No offline caching.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Pass-through: always hit the network, no caching layer.
});
