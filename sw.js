// sw.js — Service Worker for www.mwsguy.com
const CACHE_NAME = "mwsguy-cache-v3";

// ✅ Ye wahi pages cache karenge jo visitors zyada kholte hain
const PAGES_TO_CACHE = [
  "/", 
  "/?m=1",
  "/p/how-to-use-mwsguy-video-streaming-tool.html",
  "/p/how-to-use-mwsguy-video-streaming-tool.html?m=1",
  "/p/you-unlocked-video-streaming-tool.html",
  "/p/you-unlocked-video-streaming-tool.html?m=1",
  "/p/collection-hub.html",
  "/p/collection-hub.html?m=1",
  "/p/all-tool-and-pages.html",
  "/p/all-tool-and-pages.html?m=1"
];

// ✅ Install phase — Cache important pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PAGES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ✅ Activate phase — Old caches delete
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ✅ Fetch phase — Serve cache first, network fallback
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((response) => {
      if (response) {
        // 🔹 Cache hit
        return response;
      }

      // 🔹 Network fetch + cache store
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });

          return networkResponse;
        })
        .catch(() => {
          // 🔹 Offline fallback: home page cache
          return caches.match("/", { ignoreSearch: true });
        });
    })
  );
});
