// sw.js — Final Service Worker for www.mwsguy.com
const CACHE_NAME = "mwsguy-cache-final-v2";

// Pages to cache
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

// Install event — cache important pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PAGES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate event — delete old caches
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

// Fetch event — serve cache first, fallback to home page if offline
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((response) => {
      if (response) return response; // cache hit

      // If home page request, serve home page cache
      const url = new URL(request.url);
      if (url.pathname === "/" || url.pathname === "/index.html") {
        return caches.match("/", { ignoreSearch: true }) || caches.match("/?m=1");
      }

      // Network fetch + cache store
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;

          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clonedResponse));

          return networkResponse;
        })
        .catch(() => {
          // Offline fallback: always serve home page
          return caches.match("/", { ignoreSearch: true }) || caches.match("/?m=1");
        });
    })
  );
});
