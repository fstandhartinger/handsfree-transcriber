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
    console.log('Attempting to share...');
    if (isMobile) {
      try {
        await navigator.share({
          text: text,
        });
        console.log('Content shared successfully via native share');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          handleCopyToClipboard();
        }
      }
    } else {
      handleCopyToClipboard();
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard');
      toast({
        description: "Text in die Zwischenablage kopiert",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        description: "Fehler beim Kopieren in die Zwischenablage",
        variant: "destructive",
      });
    }
  };

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
};

export default ShareButton;