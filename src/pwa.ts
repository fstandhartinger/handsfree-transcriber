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

      // Check for updates periodically
      setInterval(() => {
        registration.update();
        console.log('Checking for service worker updates...');
      }, 1000 * 60 * 60); // Check every hour

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  } else {
    console.log('Service Workers are not supported');
  }
}; 