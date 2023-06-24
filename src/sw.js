var CACHE_NAME = "2023-06-25 00:25";
var urlsToCache = [
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

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
