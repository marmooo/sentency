var CACHE_NAME = '2021-07-06 10:40';
var urlsToCache = [
  '/sentency/',
  '/sentency/index.js',
  '/sentency/bgm.mp3',
  '/sentency/cat.mp3',
  '/sentency/correct.mp3',
  '/sentency/end.mp3',
  '/sentency/index.js',
  '/sentency/keyboard.mp3',
  '/sentency/favicon/original.svg',
  'https://marmooo.github.io/fonts/textar-light.woff2',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches
    .open(CACHE_NAME)
    .then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
