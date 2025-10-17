// sw.js — MwsGuy Offline Cache Fix
const CACHE_NAME = "mwsguy-cache-v5";

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

// ✅ Install phase
self.addEventListener("install", (event) => {
  console.log("🟢 Installing SW & caching pages...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PAGES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ✅ Activate phase
self.addEventListener("activate", (event) => {
  console.log("🟢 Activating SW...");
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

// ✅ Fetch phase
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        console.log("✅ Cache hit:", event.request.url);
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            console.warn("⚠️ Network failed:", event.request.url);
            return networkResponse;
          }

          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));

          return networkResponse;
        })
        .catch(() => {
          console.warn("📴 Offline fallback triggered:", event.request.url);
          return caches.match("/", { ignoreSearch: true });
        });
    })
  );
});
