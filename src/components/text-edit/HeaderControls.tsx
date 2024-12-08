import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareButton, { ClipboardButton } from "@/components/ShareButton";
import ProfileButton from "@/components/ProfileButton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface HeaderControlsProps {
  onBack: () => void;
  text: string;
  isProcessing: boolean;
}

const HeaderControls = ({ onBack, text, isProcessing }: HeaderControlsProps) => {
  return (
    <div className="flex items-center justify-between px-4 h-14 bg-background">
      <Button
        onClick={onBack}
        variant="outline"
        size="icon"
        className="w-10 h-10 p-0"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      {isProcessing && (
        <div className="absolute left-1/2 -translate-x-1/2">
          <LoadingSpinner size="md" className="text-primary" />
          <div className="sr-only">Loading indicator should be visible</div>
        </div>
      )}
      
      <div className="flex gap-2 items-center">
        <ClipboardButton text={text} />
        {!(window as any).chrome?.webview?.hostObjects?.transcriberHost && (
          <ShareButton text={text} />
        )}
        <ProfileButton />
      </div>
    </div>
  );
};

export default HeaderControls;