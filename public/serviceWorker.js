const CACHE_NAME = "v1";
const urlsToCache = ["offline2.html"];

const self = this;

// Install
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(urlsToCache);
    })()
  );
});

// Wait
self.addEventListener("fetch", (event) => {
  // You can use `respondWith()` to answer ASAP...
  // event.respondWith();

  // ...and `waitUntil()` to prevent the worker to be killed until
  // the cache is updated.
  /*   event.waitUntil(
    update(event.request)
      // Finally, send a message to the client to inform it about the
      // resource is up to date.
      .then(refresh)
  ); */

  event.respondWith(
    caches.match(event.request).then(async () => {
      console.log("serving from cache: ", event.request);
      return await fetch(event.request)
        .then((res) => {
          console.log("serving from fetch: ", event.request);
          return res;
        })
        .catch(() => {
          console.log("serving from fallback: ", caches.match("offline.html"));
          return caches.match("offline2.html");
        });
    })
  );
});

//
const getFromCache = () =>
  Promise.all(
    urlsToCache.map((url) =>
      caches.open(CACHE_NAME).then((cache) => cache.match(url))
    )
  );

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

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
function fromCache(request) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(request);
  });
}

// Update consists in opening the cache, performing a network request and
// storing the new response data.
function update(request) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response.clone()).then(function () {
        return response;
      });
    });
  });
}

// Sends a message to the clients.
function refresh(response) {
  return self.clients.matchAll().then(function (clients) {
    clients.forEach(function (client) {
      // Encode which resource has been updated. By including the
      // [ETag](https://en.wikipedia.org/wiki/HTTP_ETag) the client can
      // check if the content has changed.
      var message = {
        type: "refresh",
        url: response.url,
        // Notice not all servers return the ETag header. If this is not
        // provided you should use other cache headers or rely on your own
        // means to check if the content has changed.
        eTag: response.headers.get("ETag"),
      };
      // Tell the client about the update.
      client.postMessage(JSON.stringify(message));
    });
  });
}
