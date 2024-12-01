import { Square, Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LoadingOverlay from "./LoadingOverlay";

interface RecordingModalProps {
  onStop: () => void;
  selectedText?: string | null;
  mode: 'rephrase' | 'instruction';
  isRecording: boolean;
  onStartRecording: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

const RecordingModal = ({ 
  onStop, 
  selectedText, 
  mode, 
  isRecording, 
  onStartRecording,
  onCancel,
  isProcessing = false
}: RecordingModalProps) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 relative">
        <Button
          onClick={onCancel}
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
        >
          <X className="h-4 w-4" />
        </Button>

        {!isRecording && !isProcessing ? (
          <>
            <h3 className="text-lg font-semibold mb-4">
              {mode === 'rephrase' ? t('recording.rephraseTitle') : t('recording.instructionTitle')}
            </h3>
            
            <p className="text-gray-600 mb-6 whitespace-pre-line">
              {mode === 'rephrase' ? t('recording.rephraseDescription') : t('recording.instructionDescription')}
            </p>

            {selectedText && (
              <div className="mb-6 space-y-2">
                <p className="text-sm font-medium">{t('recording.selectedText')}</p>
                <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded line-through">
                  {selectedText}
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={onStartRecording}
                size="lg"
                className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center"
              >
                <Mic className="w-8 h-8 text-white" />
              </Button>
            </div>
          </>
        ) : isProcessing ? (
          <LoadingOverlay message={t('processing')} />
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default RecordingModal;