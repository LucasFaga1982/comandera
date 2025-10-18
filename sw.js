// sw.js
const CACHE = "pgl-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./logo-192.png",
  "./logo-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((networkRes) => {
        try {
          if (req.method === "GET" && new URL(req.url).origin === location.origin) {
            caches.open(CACHE).then((cache) => cache.put(req, networkRes.clone()));
          }
        } catch (e) {}
        return networkRes;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
