import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface ShareButtonProps {
  text: string;
}

const ShareButton = ({ text }: ShareButtonProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleShare = async () => {
    console.log('Attempting to share with navigator.share...');
    if (navigator.share) {
      try {
        await navigator.share({
          text: text,
        });
        console.log('Content shared successfully via navigator.share');
      } catch (error) {
        // Only fallback if it's not an AbortError (user cancelling the share)
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          handleWhatsAppShare();
        }
      }
    } else {
      console.log('Web Share API not supported, falling back to WhatsApp...');
      handleWhatsAppShare();
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleClipboardShare = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        description: "Text copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        description: "Error copying to clipboard",
        variant: "destructive",
      });
    }
  };

  // On mobile devices, use the native share dialog
  if (isMobile) {
    return (
      <Button
        onClick={handleShare}
        variant="outline"
        size="icon"
        className="fixed top-4 right-4"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    );
  }

  // On desktop, show our custom dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 right-4"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleWhatsAppShare}>
          WhatsApp Web
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleClipboardShare}>
          Copy to clipboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;