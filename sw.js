// Service Worker: v6 - Estrategias y lista de assets corregida
const VERSION = "v6";
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

// CORREGIDO: Lista completa de assets de tu index.html
const STATIC_ASSETS = [
  "/",
  "/styles.css",
  "/scripts.js",
  "/favicon.avif",
  "/favicon-96x96.avif",
  "/web-app-manifest-192x192.avif", // <-- Archivo que faltaba
  "/web-app-manifest-512x512.avif", // <-- Archivo que faltaba
  "/apple-touch-icon.avif",
  "/site.webmanifest"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(err => console.error("FaroDigital SW Precaching failed:", err))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== STATIC_CACHE && k !== RUNTIME_CACHE) {
            return caches.delete(k);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Network first para documentos HTML
  if (request.destination === "document") {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Cache first para todo lo demás (assets, imágenes, etc.)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request).then((fetchResponse) => {
        return caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});