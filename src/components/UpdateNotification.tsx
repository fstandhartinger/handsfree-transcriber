import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

const UpdateNotification = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const { t } = useTranslation();

  const reloadPage = () => {
    if (waitingWorker) {
      // Zuerst den Service Worker aktivieren
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Listener für den statechange Event hinzufügen
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Seite erst neu laden, wenn der neue Service Worker die Kontrolle übernommen hat
        window.location.reload();
      });
    }
  };

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.ready.then(registration => {
      console.log('Service Worker bereit');
      
      // Auf neue Version prüfen
      const handleWaiting = () => {
        console.log('Neue Version verfügbar');
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdateDialog(true);
        }
      };

      // Prüfen ob bereits ein wartender Service Worker existiert
      if (registration.waiting) {
        handleWaiting();
      }

      // Auf zukünftige Updates hören
      registration.addEventListener('waiting', handleWaiting);

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
        ? 60 * 1000     // Jede Minute im PWA-Modus
        : 60 * 60 * 1000; // Jede Stunde im Browser-Modus

      const interval = setInterval(checkForUpdates, updateInterval);
      
      // Auch prüfen, wenn die App wieder online kommt
      window.addEventListener('online', checkForUpdates);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('online', checkForUpdates);
        registration.removeEventListener('waiting', handleWaiting);
      };
    });
  }, []);

  return (
    <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('update.title')}</DialogTitle>
          <DialogDescription>
            {t('update.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
            {t('buttons.later')}
          </Button>
          <Button onClick={reloadPage}>
            {t('buttons.updateNow')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateNotification;