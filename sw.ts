/// <reference lib="webworker" />
/// <reference lib="es2015" />

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open('offline-cache').then((cache) => {
      return cache.addAll([
        '/images/logo-connect-light.svg',
        '/images/pwa/manifest-icon-192.maskable.png',
        '/images/pwa/manifest-icon-512.maskable.png',
      ]);
    }),
  );
});
