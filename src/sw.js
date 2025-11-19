const cacheName = "2025-11-20 00:00";
const urlsToCache = [
  "/sentency/index.js",
  "/sentency/mp3/bgm.mp3",
  "/sentency/mp3/cat.mp3",
  "/sentency/mp3/correct3.mp3",
  "/sentency/mp3/end.mp3",
  "/sentency/mp3/keyboard.mp3",
  "/sentency/favicon/favicon.svg",
  "https://marmooo.github.io/fonts/textar-light.woff2",
];

async function preCache() {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urlsToCache.map((url) =>
      cache.add(url).catch((e) => console.warn("Failed to cache", url, e))
    ),
  );
  self.skipWaiting();
}

async function handleFetch(event) {
  const cached = await caches.match(event.request);
  return cached || fetch(event.request);
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((name) => name !== cacheName ? caches.delete(name) : null),
  );
  self.clients.claim();
}

self.addEventListener("install", (event) => {
  event.waitUntil(preCache());
});
self.addEventListener("fetch", (event) => {
  event.respondWith(handleFetch(event));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(cleanOldCaches());
});
