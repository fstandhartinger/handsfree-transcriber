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
    <div className="fixed bottom-4 right-4 flex flex-col-reverse gap-2">
      {!isEditMode ? (
        <>
          <Button 
            onClick={() => onStyleChange("Formal")} 
            size="icon"
            className="rounded-full shadow-lg"
            disabled={isProcessing}
          >
            <FileText className="w-5 h-5" />
          </Button>
          <Button 
            onClick={() => onStyleChange("Concise")} 
            size="icon"
            className="rounded-full shadow-lg"
            disabled={isProcessing}
          >
            <AlertCircle className="w-5 h-5" />
          </Button>
          <Button 
            onClick={() => onStyleChange("Casual")} 
            size="icon"
            className="rounded-full shadow-lg"
            disabled={isProcessing}
          >
            <Users className="w-5 h-5" />
          </Button>
          <Button
            onClick={isRecordingRephrase ? onStopRephraseRecording : onStartRephraseRecording}
            size="icon"
            className="rounded-full shadow-lg"
            disabled={isProcessing}
          >
            <Mic className="w-5 h-5" />
          </Button>
          {previousTextExists && (
            <Button 
              onClick={onUndo} 
              variant="outline" 
              size="icon"
              className="rounded-full shadow-lg"
              disabled={isProcessing}
            >
              <Undo className="w-5 h-5" />
            </Button>
          )}
        </>
      ) : (
        <>
          <Button
            onClick={onCancel}
            variant="outline"
            size="icon"
            className="rounded-full shadow-lg"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleEditClick}
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg"
            disabled={isProcessing}
          >
            <CheckCircle2 className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
};

export default TextControls;