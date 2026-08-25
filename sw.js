/* Barry Sanders Collectors Hub — service worker (network-first, offline fallback) */
const CACHE = 'bshub-v2';
/* Do NOT auto-skipWaiting: a new version installs and waits so the app can
   show an "Update available" prompt. It activates only when the user taps Update. */
self.addEventListener('install', e => {/* wait for user */});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => { try { c.put(req, copy); } catch (x) {} });
        return res;
      })
      .catch(() => caches.match(req).then(m => m || caches.match('./index.html') || caches.match('./')))
  );
});
