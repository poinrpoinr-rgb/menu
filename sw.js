/* ========== Service Worker لدعم العمل بدون إنترنت (TAZA 041 PWA) ========== */
const CACHE_NAME = "taza-041-v5";

// الملفات الأساسية التي تُحفظ فور فتح الموقع
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./games.html",
  "./manifest.json",
  "./css/style.css",
  "./js/app.js",
  "./js/menu.js",
  "./js/animations.js",
  "./js/refresh.js",
  "./js/extras.js",
  "./js/firebase-sync.js",
  "./data/menu.json",
  "./assets/images/logo.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // استثناء طلبات Firebase والـ APIs السحابية من الكاش الثابت (لأنها تتزامن عبر localStorage)
  if (
    url.origin !== location.origin ||
    url.pathname.endsWith("admin.html") ||
    url.pathname.endsWith("admin.js")
  ) {
    return;
  }

  // استراتيجية Network-First مع الرجوع للكاش فوراً عند انقطاع الإنترنت
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
  .catch(() =>
        caches.match(req).then((cached) => {
          if (cached) return cached;
          if (req.mode === "navigate") return caches.match("./index.html");
          return new Response("", { status: 503 });
      );
});
