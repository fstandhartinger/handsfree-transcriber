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

  if (isMobile) {
    return (
      <Button
        onClick={handleShare}
        variant="outline"
        size="icon"
        className="w-10 h-10 p-0 flex items-center justify-center"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 p-0 flex items-center justify-center"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleWhatsAppShare}>
          WhatsApp Web
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;