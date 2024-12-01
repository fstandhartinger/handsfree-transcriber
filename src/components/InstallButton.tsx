import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

const InstallButton = () => {
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    console.log('Setting up install button listeners');
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
      console.log('App is installable');
    });

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      deferredPrompt = null;
      console.log('PWA was installed');
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('Installation prompt not available');
      return;
    }

    console.log('Showing install prompt');
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    deferredPrompt = null;
    setIsInstallable(false);
  };

  if (!isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      size="icon"
      className="w-10 h-10 p-0"
    >
      <Download className="h-4 w-4" />
    </Button>
  );
};

export default InstallButton;