import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RecordingModal from "./RecordingModal";
import RephraseModal from "./RephraseModal";
import LoadingOverlay from "./LoadingOverlay";
import TextControls from "./TextControls";
import EditableText from "./EditableText";
import { useAudioRecording } from "./hooks/useAudioRecording";
import { useAudioProcessing } from "./hooks/useAudioProcessing";

interface TextEditViewProps {
  text: string;
  onBack: () => void;
}

const TextEditView = ({ text, onBack }: TextEditViewProps) => {
  const [currentText, setCurrentText] = useState(text);
  const [textHistory, setTextHistory] = useState<string[]>([text]); // History-Stack
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [textBeforeEdit, setTextBeforeEdit] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { 
    isRecording: isRecordingInstruction, 
    startRecording: startInstructionRecording, 
    stopRecording: stopInstructionRecording 
  } = useAudioRecording();
  
  const {
    isRecording: isRecordingRephrase,
    startRecording: startRephraseRecording,
    stopRecording: stopRephraseRecording
  } = useAudioRecording();

  const {
    isProcessing,
    processAudioForRephrase,
    processAudioForInstruction
  } = useAudioProcessing(currentText, addToHistory, setCurrentText);

  // Funktion zum Hinzufügen eines neuen Textzustands zur Historie
  function addToHistory(newText: string) {
    console.log('Adding to history:', { newText, currentIndex: historyIndex });
    
    // Entferne alle Zustände nach dem aktuellen Index
    const newHistory = textHistory.slice(0, historyIndex + 1);
    newHistory.push(newText);
    
    setTextHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    console.log('History updated:', { newHistory, newIndex: newHistory.length - 1 });
  }

  const handleStyleChange = async (style: string) => {
    try {
      console.log('Starting style change:', style);

      const { data, error } = await supabase.functions.invoke('refine-text', {
        body: { text: currentText, style: style.toLowerCase() },
      });

      if (error) throw error;
      if (!data?.text) throw new Error('Invalid response from text refinement service');

      addToHistory(data.text);
      setCurrentText(data.text);
      navigator.clipboard.writeText(data.text);
      toast({
        description: "Updated text copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      console.error('Style change error:', error);
      toast({
        description: error instanceof Error ? error.message : "Error updating text style",
        variant: "destructive",
      });
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      console.log('Performing undo:', { currentIndex: historyIndex, targetIndex: historyIndex - 1 });
      
      const previousText = textHistory[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentText(previousText);
      
      navigator.clipboard.writeText(previousText);
      toast({
        description: "Previous text restored and copied to clipboard",
        duration: 2000,
      });
      
      console.log('Undo complete:', { newText: previousText, newIndex: historyIndex - 1 });
    }
  };

  const handleEditModeChange = (isEdit: boolean) => {
    if (isEdit) {
      setTextBeforeEdit(currentText);
    }
    setIsEditMode(isEdit);
  };

  const handleCancel = () => {
    if (textBeforeEdit !== null) {
      setCurrentText(textBeforeEdit);
    }
    setIsEditMode(false);
    setSelectedText(null);
    setTextBeforeEdit(null);
  };

  const handleStopInstructionRecording = async () => {
    const audioBlob = await stopInstructionRecording();
    await processAudioForInstruction(audioBlob, selectedText);
    setSelectedText(null);
    setIsEditMode(false);
    setTextBeforeEdit(null);
  };

  const handleStopRephraseRecording = async () => {
    const audioBlob = await stopRephraseRecording();
    await processAudioForRephrase(audioBlob);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto p-4">
      <Button
        variant="ghost"
        className="self-start mb-4"
        onClick={onBack}
      >
        <ArrowLeft className="w-6 h-6" />
      </Button>

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
        onCancel={handleCancel}
      />

      {isProcessing && <LoadingOverlay />}
      {isRecordingInstruction && (
        <RecordingModal 
          onStop={handleStopInstructionRecording}
          selectedText={selectedText || ""}
        />
      )}
      {isRecordingRephrase && <RephraseModal onStop={handleStopRephraseRecording} />}
    </div>
  );
};

export default TextEditView;