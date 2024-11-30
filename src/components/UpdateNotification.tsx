import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const UpdateNotification = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

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
            action: <Button 
              onClick={() => {
                setShowReload(false);
                if (waitingWorker) {
                  console.log('Sende SKIP_WAITING an Service Worker');
                  waitingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
                window.location.reload();
              }}
              variant="outline"
              size="sm"
            >
              Aktualisieren
            </Button>
          });
        }
      });
    });

    const checkForUpdates = () => {
      console.log('Prüfe auf Updates...');
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
      }
    };

    const interval = setInterval(checkForUpdates, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [waitingWorker]);

  return null;
};

export default UpdateNotification;