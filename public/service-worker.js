const CACHE_NAME = 'handsfree-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Log function
const log = (...args) => {
  console.log('[Service Worker]', ...args);
};

// Install event - cache core assets
self.addEventListener('install', (event) => {
  log('Installing...');
  // Don't skipWaiting here to prevent abrupt page takeovers
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        log('Caching static assets...');
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => 
            cache.add(asset).catch(err => {
              log(`Failed to cache ${asset}:`, err);
              return null;
            })
          )
        );
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  log('Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Only claim clients when necessary
        if (self.registration.active) {
          log('Claiming clients...');
          return self.clients.claim();
        }
      })
  );
});

// Fetch event - cache first for static assets, network first for everything else
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip certain URLs
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/supabase/') ||
      event.request.url.includes('chrome-extension://')) {
    return;
  }

  const url = new URL(event.request.url);
  const isStaticAsset = STATIC_ASSETS.includes(url.pathname);

  event.respondWith(
    (async () => {
      // Cache-first for static assets
      if (isStaticAsset) {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
      }

      try {
        const response = await fetch(event.request);
        if (response.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        throw error;
      }
    })()
  );
}); 