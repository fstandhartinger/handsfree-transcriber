import { Square, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface RecordingModalProps {
  onStop: () => void;
  selectedText?: string;
  mode: 'rephrase' | 'instruction';
  isRecording: boolean;
  onStartRecording: () => void;
}

const RecordingModal = ({ 
  onStop, 
  selectedText, 
  mode, 
  isRecording, 
  onStartRecording 
}: RecordingModalProps) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center animate-fade-in">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        {!isRecording ? (
          <>
            <h3 className="text-lg font-semibold mb-4">
              {mode === 'rephrase' ? t('recording.rephraseTitle') : t('recording.instructionTitle')}
            </h3>
            
            <p className="text-gray-600 mb-6">
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
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default RecordingModal;