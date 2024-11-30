import { Mic, FileText, AlertCircle, Undo, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface TextControlsProps {
  onStyleChange: (style: string) => void;
  onUndo: () => void;
  previousTextExists: boolean;
  isProcessing: boolean;
  onStartInstructionRecording: () => void;
  onStopInstructionRecording: () => void;
  isRecordingInstruction: boolean;
  selectedText: string | null;
  onStartRephraseRecording: () => void;
  onStopRephraseRecording: () => void;
  isRecordingRephrase: boolean;
  isEditMode: boolean;
  onEditModeChange: (isEdit: boolean) => void;
  onCancel?: () => void;
}

const TextControls = ({
  onStyleChange,
  onUndo,
  previousTextExists,
  isProcessing,
  onStartInstructionRecording,
  onStopInstructionRecording,
  isRecordingInstruction,
  selectedText,
  onStartRephraseRecording,
  onStopRephraseRecording,
  isRecordingRephrase,
  isEditMode,
  onEditModeChange,
  onCancel,
}: TextControlsProps) => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-4 right-4 flex flex-col-reverse gap-2">
      {!isEditMode ? (
        <>
          <Button 
            onClick={() => onStyleChange("Formal")} 
            className="rounded-full shadow-lg flex items-center gap-2 px-4"
            disabled={isProcessing}
          >
            <FileText className="w-5 h-5" />
            {t('buttons.formal')}
          </Button>
          <Button 
            onClick={() => onStyleChange("Concise")} 
            className="rounded-full shadow-lg flex items-center gap-2 px-4"
            disabled={isProcessing}
          >
            <AlertCircle className="w-5 h-5" />
            {t('buttons.concise')}
          </Button>
          <Button 
            onClick={() => onStyleChange("Casual")} 
            className="rounded-full shadow-lg flex items-center gap-2 px-4"
            disabled={isProcessing}
          >
            <Users className="w-5 h-5" />
            {t('buttons.casual')}
          </Button>
          <Button
            onClick={isRecordingRephrase ? onStopRephraseRecording : onStartRephraseRecording}
            className="rounded-full shadow-lg flex items-center gap-2 px-4"
            disabled={isProcessing}
          >
            <Mic className="w-5 h-5" />
            {t('buttons.rephrase')}
          </Button>
          {previousTextExists && (
            <Button 
              onClick={onUndo} 
              variant="outline" 
              className="rounded-full shadow-lg flex items-center gap-2 px-4"
              disabled={isProcessing}
            >
              <Undo className="w-5 h-5" />
              {t('buttons.undo')}
            </Button>
          )}
        </>
      ) : null}
    </div>
  );
};

export default TextControls;