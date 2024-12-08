import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LoadingOverlay from "./LoadingOverlay";

interface NewRecordingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStop: () => void;
  isProcessing?: boolean;
}

const NewRecordingDialog = ({ 
  open, 
  onOpenChange,
  onStop,
  isProcessing = false 
}: NewRecordingDialogProps) => {
  const { t } = useTranslation();

  if (isProcessing) {
    return <LoadingOverlay />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 relative">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <span className="text-gray-700">{t('recording.status')}</span>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={onStop}
                variant="outline"
                size="lg"
                className="rounded-full w-16 h-16 flex items-center justify-center"
              >
                <Square className="w-8 h-8" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewRecordingDialog;