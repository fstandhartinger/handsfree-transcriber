import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

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
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>{t('status.transcribing')}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-6 p-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-500 rounded-full recording-pulse" />
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
      </DialogContent>
    </Dialog>
  );
};

export default NewRecordingDialog;