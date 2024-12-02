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
            description: "Update verfügbar: Eine neue Version der App ist verfügbar.",
            duration: 0,
            variant: "default"
          });
        }
      });

      // Periodisch nach Updates suchen
      const checkForUpdates = async () => {
        try {
          console.log('Prüfe auf Updates...');
          await registration.update();
        } catch (error) {
          console.error('Fehler beim Prüfen auf Updates:', error);
        }
      };

      // Häufigere Prüfung im PWA-Modus
      const updateInterval = window.matchMedia('(display-mode: standalone)').matches
        ? 15 * 60 * 1000  // Alle 15 Minuten im PWA-Modus
        : 60 * 60 * 1000; // Jede Stunde im Browser-Modus

      const interval = setInterval(checkForUpdates, updateInterval);
      
      // Auch prüfen, wenn die App wieder online kommt
      window.addEventListener('online', checkForUpdates);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('online', checkForUpdates);
      };
    });
  }, [waitingWorker]);

  return null;
};

export default UpdateNotification;