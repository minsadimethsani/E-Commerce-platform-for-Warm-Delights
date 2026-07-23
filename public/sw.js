const CACHE_NAME = "warm-delights-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/menu",
  "/signature-cakes",
  "/gifts-and-hampers",
  "/custom-creations",
  "/about",
  "/contact",
  "/hero_slide_1.jpg",
  "/category_cakes.png",
  "/category_custom.png",
  "/about_bakery.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Stale-While-Revalidate strategy for static assets and page requests
  if (
    url.origin === location.origin ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/api/products")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
