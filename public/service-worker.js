const CACHE_NAME = 'handsfree-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Log function
const log = (...args) => {
  console.log('[Service Worker]', ...args);
};

// Install event - cache core assets only
self.addEventListener('install', (event) => {
  log('Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        log('Caching core assets...');
        return Promise.allSettled(
          ASSETS_TO_CACHE.map(asset => 
            cache.add(asset).catch(err => {
              log(`Failed to cache ${asset}:`, err);
              return null;
            })
          )
        );
      })
      .then(() => self.skipWaiting())
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
        log('Claiming clients...');
        return self.clients.claim();
      })
      .then(() => {
        log('Service Worker activated and controlling the page');
      })
  );
});

// Fetch event - network first, falling back to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip certain URLs
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/supabase/') ||
      event.request.url.includes('chrome-extension://')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone))
            .catch(() => {/* Ignore cache errors */});
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            // For navigation requests, try the root
            if (event.request.mode === 'navigate') {
              return caches.match('/') || fetch(event.request);
            }
            // Let the browser handle the error naturally
            return fetch(event.request);
          });
      })
  );
}); 