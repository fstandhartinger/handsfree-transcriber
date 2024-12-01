const CACHE_NAME = 'handsfree-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/mic-icon-192.png',
  '/mic-icon-512.png',
  '/favicon.ico',
  '/screenshot.png',
  '/og-image.png'
];

// Log function
const log = (...args) => {
  console.log('[Service Worker]', ...args);
};

// Install event - cache all static assets
self.addEventListener('install', (event) => {
  log('Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        log('Caching static assets...');
        return cache.addAll(ASSETS_TO_CACHE)
          .then(() => {
            log('Static assets cached successfully');
          })
          .catch((error) => {
            log('Error caching static assets:', error);
            throw error;
          });
      })
      .then(() => {
        log('Skip waiting...');
        return self.skipWaiting();
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
  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    log('Skipping fetch:', event.request.url);
    return;
  }

  // Skip certain URLs
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/supabase/') ||
      event.request.url.includes('chrome-extension://')) {
    log('Skipping API/dynamic content:', event.request.url);
    return;
  }

  event.respondWith(
    // Try network first
    fetch(event.request)
      .then(response => {
        log('Network fetch successful:', event.request.url);
        
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
              log('Response cached:', event.request.url);
            })
            .catch(error => {
              log('Error caching response:', error);
            });
        }
        
        return response;
      })
      .catch(() => {
        log('Network fetch failed, trying cache:', event.request.url);
        
        // Try cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              log('Serving from cache:', event.request.url);
              return response;
            }
            
            // Handle navigation requests
            if (event.request.mode === 'navigate') {
              log('Navigation request failed, serving root:', event.request.url);
              return caches.match('/');
            }
            
            log('No cache found for:', event.request.url);
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
  );
}); 