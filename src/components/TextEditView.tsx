import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EditableText from "./EditableText";
import TextControls from "./TextControls";
import ShareButton from "./ShareButton";
import InstallButton from "./InstallButton";
import { useAudioRecording } from "./hooks/useAudioRecording";
import { useAudioProcessing } from "./hooks/useAudioProcessing";

interface TextEditViewProps {
  text: string;
  onBack: () => void;
}

const TextEditView = ({ text, onBack }: TextEditViewProps) => {
  const [currentText, setCurrentText] = useState(text);
  const [textHistory, setTextHistory] = useState<string[]>([text]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [textBeforeEdit, setTextBeforeEdit] = useState<string | null>(null);
  const { toast } = useToast();
  const {
    isRecording: isRecordingInstruction,
    startRecording: startInstructionRecording,
    stopRecording: handleStopInstructionRecording,
  } = useAudioRecording();

  const {
    isRecording: isRecordingRephrase,
    startRecording: startRephraseRecording,
    stopRecording: handleStopRephraseRecording,
  } = useAudioRecording();

  const addToHistory = (newText: string) => {
    const newHistory = textHistory.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setTextHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const { isProcessing, processAudioForRephrase, processAudioForInstruction } = useAudioProcessing(
    currentText,
    addToHistory,
    setCurrentText
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentText(textHistory[historyIndex - 1]);
    }
  };

  const handleStyleChange = async (style: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('rephrase', {
        body: { text: currentText, style },
      });

      if (error) throw error;

      setCurrentText(data.text);
      addToHistory(data.text);
    } catch (error) {
      console.error('Error:', error);
      toast({
        description: "Error processing text. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditModeChange = (isEdit: boolean) => {
    if (isEdit) {
      setTextBeforeEdit(currentText);
    }
    setIsEditMode(isEdit);
  };

  const handleCancelEdit = () => {
    if (textBeforeEdit) {
      setCurrentText(textBeforeEdit);
    }
    setIsEditMode(false);
    setTextBeforeEdit(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <InstallButton />
        <ShareButton text={currentText} />
      </div>
      <ScrollArea className="flex-1 p-4">
        <EditableText
          text={currentText}
          onChange={(newText) => {
            setCurrentText(newText);
            addToHistory(newText);
          }}
          onTextSelect={setSelectedText}
          isEditMode={isEditMode}
          onEditModeChange={handleEditModeChange}
        />
      </ScrollArea>
      <TextControls
        onStyleChange={handleStyleChange}
        onUndo={handleUndo}
        previousTextExists={historyIndex > 0}
        isProcessing={isProcessing}
        onStartInstructionRecording={startInstructionRecording}
        onStopInstructionRecording={handleStopInstructionRecording}
        isRecordingInstruction={isRecordingInstruction}
        selectedText={selectedText}
        onStartRephraseRecording={startRephraseRecording}
        onStopRephraseRecording={handleStopRephraseRecording}
        isRecordingRephrase={isRecordingRephrase}
        isEditMode={isEditMode}
        onEditModeChange={handleEditModeChange}
        onCancel={handleCancelEdit}
      />
    </div>
  );
};

export default TextEditView;