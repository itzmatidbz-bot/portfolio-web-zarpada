// Service Worker: estrategias por tipo, rápidas y seguras
const VERSION = "v3";
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const STATIC_ASSETS = [
  "/",                // shell
  "/styles.css",
  "/scripts.js",
  "/logo.png",
  "/favicon.ico",
  "/favicon-96x96.png",
  "/apple-touch-icon.png",
  "/site.webmanifest"
];

// Install: precache estáticos esenciales
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(STATIC_ASSETS))
  );
});

// Activate: limpieza de versiones viejas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k.includes(VERSION) ? undefined : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Fetch: estrategias diferenciadas
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // no cachear cross-origin para evitar problemas con CORS/privacidad
  if (url.origin !== self.location.origin) return;

  // Documentos HTML → network-first (offline: cache)
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match("/")))
    );
    return;
  }

  // CSS/JS/Fonts → stale-while-revalidate
  if (["style", "script", "font"].includes(req.destination)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetched = fetch(req).then((res) => {
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, res.clone()));
          return res;
        });
        return cached || fetched;
      })
    );
    return;
  }

  // Imágenes → cache-first con límite
  if (req.destination === "image") {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then(async (c) => {
            await c.put(req, copy);
            // límite simple a ~60 imágenes
            const keys = await c.keys();
            const imgs = keys.filter((k) => new URL(k.url).pathname.match(/\.(png|jpg|jpeg|webp|svg)$/i));
            if (imgs.length > 60) c.delete(imgs[0]);
          });
          return res;
        });
      })
    );
  }
});
