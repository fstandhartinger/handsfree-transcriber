export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // First check if there's an existing registration
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      if (existingRegistration) {
        console.log('Existing service worker found, checking for updates...');
        await existingRegistration.update();
      }

      // Register or update the service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      console.log('Service Worker registered with scope:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('New service worker found:', newWorker?.state);
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            console.log('Service worker state changed:', newWorker.state);
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('New content is available, reloading...');
                window.location.reload();
              } else {
                console.log('Content is now available offline');
              }
            }
          });
        }
      });

      // Check for updates more frequently when in standalone mode
      const updateInterval = window.matchMedia('(display-mode: standalone)').matches
        ? 15 * 60 * 1000  // Every 15 minutes in PWA mode
        : 60 * 60 * 1000; // Every hour in browser mode

      // Check for updates periodically
      const periodicUpdate = async () => {
        try {
          await registration.update();
          console.log('Checking for service worker updates...');
        } catch (error) {
          console.error('Error checking for updates:', error);
        }
      };

      setInterval(periodicUpdate, updateInterval);

      // Also check for updates when the app comes back online
      window.addEventListener('online', periodicUpdate);

      // Additional check when the page becomes visible again
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          periodicUpdate();
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  } else {
    console.log('Service Workers are not supported');
  }
}; 