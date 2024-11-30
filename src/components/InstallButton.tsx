import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

let deferredPrompt: any = null;

const InstallButton = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Speichere das Event für später
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setIsInstallable(true);
    });

    // Wenn die App installiert wird, verstecke den Button
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

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // Clear the deferredPrompt variable
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
      className="fixed top-4 right-16"
    >
      <Download className="h-4 w-4" />
    </Button>
  );
};

export default InstallButton;