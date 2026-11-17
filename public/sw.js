// Service worker minimal : met en cache ce qui a déjà été chargé, pour que les leçons
// fonctionnent sans connexion. La page d'accueil est toujours redemandée au réseau d'abord.
const CACHE = 'mon-francais-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const estPage = req.mode === 'navigate';
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      if (estPage) {
        try {
          const rep = await fetch(req);
          if (rep.status === 200) cache.put(req, rep.clone());
          return rep;
        } catch {
          return (await cache.match(req)) || (await cache.match('./')) || Response.error();
        }
      }
      const enCache = await cache.match(req);
      const reseau = fetch(req)
        .then((rep) => {
          if (rep.status === 200) cache.put(req, rep.clone());
          return rep;
        })
        .catch(() => undefined);
      return enCache || (await reseau) || Response.error();
    })(),
  );
});
