const CACHE_NAME = "v1";
let a = 0;
a++;
const urlsToCache = ["offline.html", "logo512.png", `${a}`];

const self = this;

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Installing cache... ");

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

// Activate
self.addEventListener("activate", (event) => {
  console.log("Installed cache ");
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
