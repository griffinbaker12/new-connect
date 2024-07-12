/// <reference lib="webworker" />
/// <reference lib="es2015" />

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('*** cache bang ***');
  event.waitUntil(
    caches.open('offline-cache').then((cache) => {
      return cache.addAll([
        '/offline.html',
        '/images/logo-connect-light.svg',
        '/images/pwa/manifest-icon-192.maskable.png',
        '/images/pwa/manifest-icon-512.maskable.png',
      ]);
    }),
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const request = event.request;

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        console.log('*** Navigation failed, serving offline page ***');
        return caches.match('/offline.html') as Promise<Response>;
      }),
    );
    return;
  }

  // Handle API requests (assuming they're JSON)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response;
        })
        .catch((error) => {
          console.error('API request failed:', error);
          // Return a custom error response
          return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }),
    );
    return;
  }

  console.log('the req url is', request.url);
  // For all other requests, try network first, then cache
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request).then((cacheResponse) => {
        if (cacheResponse) {
          return cacheResponse;
        }
        console.log('*** Resource not in cache, serving offline page ***');
        return caches.match('/offline.html') as Promise<Response>;
      });
    }),
  );
});
