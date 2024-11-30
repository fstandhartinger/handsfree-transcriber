import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

let deferredPrompt: any = null;

const InstallButton = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    console.log('Setting up install button listeners');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
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

  if (!isMobile || !isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      size="icon"
      className="fixed top-4 right-16 z-50"
    >
      <Download className="h-4 w-4" />
    </Button>
  );
};

export default InstallButton;