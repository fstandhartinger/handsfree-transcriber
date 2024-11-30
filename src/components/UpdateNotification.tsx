import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

const UpdateNotification = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Überprüfe ob Service Worker unterstützt wird
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Registriere Event Listener für Updates
    navigator.serviceWorker.ready.then(registration => {
      console.log('Service Worker bereit');
      
      registration.addEventListener('waiting', event => {
        console.log('Neue Version verfügbar');
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowReload(true);
          
          toast({
            title: "Update verfügbar",
            description: "Eine neue Version ist verfügbar. Klicke hier zum Aktualisieren.",
            action: {
              label: "Aktualisieren",
              onClick: () => {
                setShowReload(false);
                if (waitingWorker) {
                  console.log('Sende SKIP_WAITING an Service Worker');
                  waitingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
                window.location.reload();
              }
            }
          });
        }
      });
    });

    // Überprüfe auf Updates
    const checkForUpdates = () => {
      console.log('Prüfe auf Updates...');
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
      }
    };

    // Prüfe regelmäßig auf Updates (alle 60 Minuten)
    const interval = setInterval(checkForUpdates, 60 * 60 * 1000);
    
    // Cleanup
    return () => clearInterval(interval);
  }, [waitingWorker]);

  return null; // Komponente rendert nichts, nutzt nur Toast für Benachrichtigungen
};

export default UpdateNotification;