import { Mic, Strikethrough, Clipboard, FileText, MessageSquare, Undo } from "lucide-react";
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
}: TextControlsProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button 
        onClick={() => onStyleChange("Formal")} 
        className="gap-2"
        disabled={isProcessing}
      >
        <FileText className="w-4 h-4" />
        Formal
      </Button>
      <Button 
        onClick={() => onStyleChange("Neutral")} 
        className="gap-2"
        disabled={isProcessing}
      >
        <MessageSquare className="w-4 h-4" />
        Neutral
      </Button>
      <Button 
        onClick={() => onStyleChange("Casual")} 
        className="gap-2"
        disabled={isProcessing}
      >
        <MessageSquare className="w-4 h-4" />
        Casual
      </Button>
      <Button
        onClick={() => onStyleChange("Rephrase")}
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
  );
};

export default TextControls;