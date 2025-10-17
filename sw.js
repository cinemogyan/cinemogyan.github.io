// sw.js — Service Worker for www.mwsguy.com
const CACHE_NAME = "mwsguy-cache-final-v1";

// ✅ Ye wahi pages cache karenge jo visitors zyada kholte hain
const PAGES_TO_CACHE = [
  "/", 
  "/?m=1",
  "/index.html",
  "/index.html?m=1",
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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PAGES_TO_CACHE))
  );
  self.skipWaiting();
});

// ✅ Activate phase — Delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      )
    )
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

      // 🔹 Home page fallback for mobile/desktop
      const url = new URL(request.url);
      if (url.pathname === "/" || url.pathname === "/index.html") {
        return caches.match("/", { ignoreSearch: true }) || caches.match("/?m=1");
      }

      // 🔹 Network fetch + cache store
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;

          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clonedResponse));

          return networkResponse;
        })
        .catch(() => {
          // 🔹 Offline fallback: always serve home page
          return caches.match("/", { ignoreSearch: true }) || caches.match("/?m=1");
        });
    })
  );
});
