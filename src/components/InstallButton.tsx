import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    deferredPrompt: BeforeInstallPromptEvent | null;
  }
}

const InstallButton = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Store deferredPrompt in window object to persist between component remounts
    if (typeof window !== 'undefined') {
      window.deferredPrompt = null;
    }

    const checkInstallable = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInstalled = localStorage.getItem('pwaInstalled') === 'true';
      const isPWASupported = 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
      
      console.log('PWA Status:', {
        isStandalone,
        isInstalled,
        isPWASupported,
        hasServiceWorker: 'serviceWorker' in navigator,
        hasBeforeInstallPrompt: 'BeforeInstallPromptEvent' in window,
        userAgent: navigator.userAgent,
        platform: navigator.platform
      });
      
      if (isStandalone || isInstalled) {
        console.log('App is already installed');
        setIsInstallable(false);
        return;
      }

      // Check if there's a stored prompt
      if (window.deferredPrompt) {
        console.log('Found stored installation prompt');
        setDeferredPrompt(window.deferredPrompt);
        setIsInstallable(true);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired', e);
      e.preventDefault();
      
      // Store the event for later use
      const promptEvent = e as BeforeInstallPromptEvent;
      window.deferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);

      // Log the current state
      console.log('Installation prompt ready:', {
        hasPrompt: !!promptEvent,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        isInstalled: localStorage.getItem('pwaInstalled') === 'true'
      });
    };

    const handleAppInstalled = () => {
      console.log('App was installed');
      localStorage.setItem('pwaInstalled', 'true');
      window.deferredPrompt = null;
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    // Initial check
    checkInstallable();

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check PWA criteria
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        console.log('Service Worker is active with scope:', registration.scope);
        
        // Check if manifest is properly loaded
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
          fetch(manifestLink.getAttribute('href') || '')
            .then(response => response.json())
            .then(manifest => {
              console.log('Manifest loaded successfully:', manifest);
            })
            .catch(error => {
              console.error('Error loading manifest:', error);
            });
        } else {
          console.warn('No manifest link found in document');
        }

        // Check if all required icons are available
        Promise.all([
          fetch('/mic-icon-192.png'),
          fetch('/mic-icon-512.png')
        ]).then(() => {
          console.log('All required icons are available');
        }).catch(error => {
          console.error('Error loading icons:', error);
        });
      });
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    const prompt = deferredPrompt || window.deferredPrompt;
    if (!prompt) {
      console.log('No installation prompt available');
      return;
    }

    try {
      console.log('Showing install prompt');
      await prompt.prompt();
      
      const { outcome } = await prompt.userChoice;
      console.log('User response to install prompt:', outcome);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        localStorage.setItem('pwaInstalled', 'true');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      window.deferredPrompt = null;
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  }, [deferredPrompt]);

  if (!isInstallable) {
    console.log('Install button not shown: app is not installable');
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      size="icon"
      className="w-10 h-10 p-0"
      title="Install App"
    >
      <Download className="h-4 w-4" />
    </Button>
  );
};

export default InstallButton;