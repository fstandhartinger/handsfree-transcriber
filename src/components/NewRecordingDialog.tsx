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
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>{t('status.transcribing')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 relative">
        <div className="space-y-6">
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
      </div>
    </div>
  );
};

export default NewRecordingDialog;