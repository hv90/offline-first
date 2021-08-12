const CACHE_NAME = "v1";
const urlsToCache = ["offline.html", "logo512.png"];

const self = this;

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Installed cache ", cache);

      return cache.addAll(urlsToCache);
    })
  );
});

// Wait
self.addEventListener("fetch", (event) => {
  console.log("requested ", event.request);

  event.respondWith(
    caches.match(event.request).then(() => {
      return fetch(event.request).catch(() => caches.match("offline.html"));
    })
  );
});

//Ready
self.addEventListener("load", (event) => {
  console.log("ready", caches);
});

// Activate
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [];
  cacheWhitelist.push(CACHE_NAME);

  console.log("activate ", event);

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
