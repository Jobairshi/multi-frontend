// Multi-Layered Cache Service Worker
// Implements cache-first for static, network-first for API

const CACHE_VERSION = "v1";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Static assets to pre-cache
const STATIC_ASSETS = ["/", "/offline"];

// Install event - pre-cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Pre-caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => console.error("[SW] Pre-cache failed:", err))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name.startsWith("static-") ||
              name.startsWith("dynamic-") ||
              (name.startsWith("api-") &&
                name !== STATIC_CACHE &&
                name !== DYNAMIC_CACHE &&
                name !== API_CACHE)
            );
          })
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Strategy 1: API endpoints - Network first with cache fallback
  if (
    url.pathname.startsWith("/api/") ||
    (url.origin !== location.origin && url.pathname.includes("/auth"))
  ) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Strategy 2: Next.js static assets - Cache first (immutable)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Strategy 3: Images - Cache first with network fallback
  if (
    url.pathname.startsWith("/images/") ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)
  ) {
    event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }

  // Strategy 4: Pages - Stale-while-revalidate
  if (url.origin === location.origin) {
    event.respondWith(staleWhileRevalidateStrategy(request));
    return;
  }

  // Default: network only for cross-origin requests
  event.respondWith(fetch(request));
});

// Network First Strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Only cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      // Clone the response before caching
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", error);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page or error response
    return new Response(
      JSON.stringify({ error: "Network error and no cached data available" }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Cache First Strategy (for static assets)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[SW] Cache and network failed:", error);
    return new Response("Asset not available", { status: 404 });
  }
}

// Stale While Revalidate Strategy (for pages)
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);

  // Fetch fresh version in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(DYNAMIC_CACHE);
        cache.then((c) => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch((err) => {
      console.log("[SW] Background fetch failed:", err);
      return null;
    });

  // Return cached version immediately if available
  return cachedResponse || fetchPromise;
}

// Message event - for cache clearing
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      })
    );
  }

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
