// sw.js — Service Worker for www.mwsguy.com

const CACHE_NAME = "mwsguy-cache-v2";

// ✅ Yahan sirf wahi pages daal jo tumhare visitors zyada kholte hain
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

// ✅ Install phase — Cache basic pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PAGES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ✅ Activate phase — Purane cache delete karo
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

// ✅ Fetch phase — Cache se serve karo, agar na mile to network se lo
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Sirf GET requests cache honge
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        // 🔹 Cache hit
        return response;
      }

      // 🔹 Network se fetch karo aur cache me save karo
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
          // 🔹 Offline fallback (agar chaho to ek offline.html add kar sakte ho)
          return caches.match("/?m=1");
        });
    })
  );
});
