import { Share2, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

interface ShareButtonProps {
  text: string;
}

export const ClipboardButton = ({ text }: ShareButtonProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        description: t('toasts.textCopied'),
        duration: 2000,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        description: t('toasts.clipboardError'),
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="icon"
      className="w-10 h-10 p-0 flex items-center justify-center"
    >
      <Clipboard className="h-4 w-4" />
    </Button>
  );
};

const ShareButton = ({ text }: ShareButtonProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: text,
        });
        console.log('Content shared successfully via native share');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast({
            description: t('toasts.shareFailed'),
            variant: "destructive",
          });
        }
      }
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