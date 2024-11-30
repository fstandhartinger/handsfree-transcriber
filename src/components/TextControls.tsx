import { Mic, Strikethrough, FileText, AlertCircle, Undo, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}: TextControlsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t">
      <div className="flex flex-wrap gap-2 justify-center max-w-screen-lg mx-auto">
        <Button 
          onClick={() => onStyleChange("Formal")} 
          className="gap-2"
          disabled={isProcessing}
        >
          <FileText className="w-4 h-4" />
          Formal
        </Button>
        <Button 
          onClick={() => onStyleChange("Concise")} 
          className="gap-2"
          disabled={isProcessing}
        >
          <AlertCircle className="w-4 h-4" />
          Concise
        </Button>
        <Button 
          onClick={() => onStyleChange("Casual")} 
          className="gap-2"
          disabled={isProcessing}
        >
          <Users className="w-4 h-4" />
          Casual
        </Button>
        <Button
          onClick={isRecordingRephrase ? onStopRephraseRecording : onStartRephraseRecording}
          className="gap-2"
          disabled={isProcessing}
        >
          <Mic className="w-4 h-4" />
          Rephrase
        </Button>
        {previousTextExists && (
          <Button 
            onClick={onUndo} 
            variant="outline" 
            className="gap-2"
            disabled={isProcessing}
          >
            <Undo className="w-4 h-4" />
            Undo
          </Button>
        )}
        {selectedText && (
          <Button
            onClick={isRecordingInstruction ? onStopInstructionRecording : onStartInstructionRecording}
            variant="secondary"
            className="gap-2"
            disabled={isProcessing}
          >
            <Strikethrough className="w-4 h-4" />
            Edit Selection
          </Button>
        )}
      </div>
    </div>
  );
};

export default TextControls;