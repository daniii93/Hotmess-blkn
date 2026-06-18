const CACHE_VERSION = "hotmess-pwa-v3";
const STATIC_CACHE = `${CACHE_VERSION}:static`;
const IMAGE_CACHE = `${CACHE_VERSION}:images`;

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/hotmess-logo-mark.svg",
  "/icons/icon-192.png",
  "/icons/icon-256.png",
  "/icons/icon-384.png",
  "/icons/icon-512.png",
  "/icons/maskable-192.png",
  "/icons/maskable-256.png",
  "/icons/maskable-384.png",
  "/icons/maskable-512.png",
];

const NETWORK_ONLY_PREFIXES = [
  "/admin",
  "/scanner",
  "/api",
  "/profile",
  "/settings",
  "/connect",
  "/friends",
  "/explore",
  "/chat",
  "/dating",
  "/business",
  "/events",
  "/tickets",
  "/wallet",
  "/communities",
  "/local-services",
  "/services",
  "/benefits",
  "/membership",
  "/trust",
  "/creator",
  "/digital-ai",
  "/login",
  "/register",
  "/reset-password",
  "/checkout",
  "/verify",
  "/onboarding",
];

function isNetworkOnly(url) {
  return NETWORK_ONLY_PREFIXES.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin || isNetworkOnly(url)) {
    return;
  }

  if (request.destination === "document") {
    return;
  }

  if (request.destination === "image") {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const network = fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached);

          return cached || network;
        }),
      ),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  if (["style", "font", "manifest"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, response.clone()));
            }
            return response;
          })
          .catch(() => cached);

        return cached || network;
      }),
    );
  }
});
