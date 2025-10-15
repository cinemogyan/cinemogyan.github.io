
// sw.js — Service Worker for www.mwsguy.com

const CACHE_NAME = "mwsguy-partial-cache-v1";
const PAGES_TO_CACHE = [
  "/", 
  "/p/how-to-use-mwsguy-video-streaming-tool",
  "/p/you-unlocked-video-streaming-tool",
  "/?m=1"
  "/p/collection-hub",
  "/p/all-tool-and-pages"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PAGES_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
