const CACHE_NAME="2023-07-24 07:50",urlsToCache=["/sentency/","/sentency/index.js","/sentency/mp3/bgm.mp3","/sentency/mp3/cat.mp3","/sentency/mp3/correct3.mp3","/sentency/mp3/end.mp3","/sentency/mp3/keyboard.mp3","/sentency/favicon/favicon.svg","https://marmooo.github.io/fonts/textar-light.woff2"];self.addEventListener("install",a=>{a.waitUntil(caches.open(CACHE_NAME).then(a=>a.addAll(urlsToCache)))}),self.addEventListener("fetch",a=>{a.respondWith(caches.match(a.request).then(b=>b||fetch(a.request)))}),self.addEventListener("activate",a=>{a.waitUntil(caches.keys().then(a=>Promise.all(a.filter(a=>a!==CACHE_NAME).map(a=>caches.delete(a)))))})