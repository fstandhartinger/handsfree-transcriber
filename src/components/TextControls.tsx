import { Mic, FileText, AlertCircle, Undo, Users, Edit2, CheckCircle2, X } from "lucide-react";
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
  
  const handleEditClick = () => {
    if (isEditMode) {
      onStartInstructionRecording();
    } else {
      onEditModeChange(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t">
      <div className="flex flex-wrap gap-2 justify-between max-w-screen-lg mx-auto">
        <div className="flex flex-wrap gap-2">
          {!isEditMode && (
            <>
              <Button 
                onClick={() => onStyleChange("Formal")} 
                className="gap-2"
                disabled={isProcessing}
              >
                <FileText className="w-4 h-4" />
                {t('buttons.formal')}
              </Button>
              <Button 
                onClick={() => onStyleChange("Concise")} 
                className="gap-2"
                disabled={isProcessing}
              >
                <AlertCircle className="w-4 h-4" />
                {t('buttons.concise')}
              </Button>
              <Button 
                onClick={() => onStyleChange("Casual")} 
                className="gap-2"
                disabled={isProcessing}
              >
                <Users className="w-4 h-4" />
                {t('buttons.casual')}
              </Button>
              <Button
                onClick={isRecordingRephrase ? onStopRephraseRecording : onStartRephraseRecording}
                className="gap-2"
                disabled={isProcessing}
              >
                <Mic className="w-4 h-4" />
                {t('buttons.rephrase')}
              </Button>
            </>
          )}
          {isEditMode ? (
            <>
              <Button
                onClick={onCancel}
                variant="outline"
                className="gap-2"
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleEditClick}
                variant="secondary"
                className="gap-2"
                disabled={isProcessing}
              >
                <CheckCircle2 className="w-4 h-4" />
                {t('buttons.finishEdit')}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEditClick}
              variant="outline"
              className="gap-2"
              disabled={isProcessing}
            >
              <Edit2 className="w-4 h-4" />
              {t('buttons.edit')}
            </Button>
          )}
        </div>
        {previousTextExists && !isEditMode && (
          <Button 
            onClick={onUndo} 
            variant="outline" 
            className="gap-2 ml-auto"
            disabled={isProcessing}
          >
            <Undo className="w-4 h-4" />
            Undo
          </Button>
        )}
      </div>
    </div>
  );
};

export default TextControls;