const CACHE_NAME = "mws-cache-v1";
const HOME_URL = "/?m=1"; // Blogger mobile view ke liye

// Cache karne wale URLs
const urlsToCache = [
  HOME_URL,
  "/", // safety ke liye normal version bhi
];

// Install event – Home page cache karo
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event – purane cache delete karo
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event – pehle cache check karo, fir network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Agar cache me mil gaya to use return karo
      if (response) {
        return response;
      }

      // Agar network se mile to use cache me add karo
      return fetch(event.request).then(fetchResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      }).catch(() => {
        // Agar offline hai aur page cache me nahi mila
        // to home page ko fallback ke roop me dikhao
        return caches.match(HOME_URL);
      });
    })
  );
});
