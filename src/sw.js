const CACHE_NAME = "2024-02-25 09:42";
const urlsToCache = [
  "/sentency/",
  "/sentency/index.js",
  "/sentency/mp3/bgm.mp3",
  "/sentency/mp3/cat.mp3",
  "/sentency/mp3/correct3.mp3",
  "/sentency/mp3/end.mp3",
  "/sentency/mp3/keyboard.mp3",
  "/sentency/favicon/favicon.svg",
  "https://marmooo.github.io/fonts/textar-light.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
