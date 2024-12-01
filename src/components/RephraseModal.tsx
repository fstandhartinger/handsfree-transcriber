import { Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface RephraseModalProps {
  onStop: () => void;
  status: 'recording' | 'processing';
}

const RephraseModal = ({ onStop, status }: RephraseModalProps) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          {status === 'recording' ? (
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          ) : (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          )}
          <span className="text-gray-700">
            {status === 'recording' 
              ? t('recording.status')
              : t('processing.status')}
          </span>
        </div>
        
        <p className="text-gray-600 mb-6 text-sm">
          {status === 'recording'
            ? t('recording.instruction')
            : t('processing.instruction')}
        </p>

        {status === 'recording' && (
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
        )}
      </div>
    </div>
  );
};

export default RephraseModal;