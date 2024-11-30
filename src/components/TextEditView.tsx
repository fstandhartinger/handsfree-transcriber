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
  const [previousText, setPreviousText] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
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
  } = useAudioProcessing(currentText, setPreviousText, setCurrentText);

  const handleStyleChange = async (style: string) => {
    try {
      console.log('Starting style change:', style);
      setPreviousText(currentText);

      const { data, error } = await supabase.functions.invoke('refine-text', {
        body: { text: currentText, style: style.toLowerCase() },
      });

      if (error) throw error;
      if (!data?.text) throw new Error('Invalid response from text refinement service');

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
    if (previousText) {
      setCurrentText(previousText);
      setPreviousText(null);
      navigator.clipboard.writeText(previousText);
      toast({
        description: "Previous text restored and copied to clipboard",
        duration: 2000,
      });
    }
  };

  const handleStopInstructionRecording = async () => {
    const audioBlob = await stopInstructionRecording();
    await processAudioForInstruction(audioBlob, selectedText);
    setSelectedText(null);
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
        onChange={setCurrentText}
        onTextSelect={setSelectedText}
      />

      <TextControls
        onStyleChange={handleStyleChange}
        onUndo={handleUndo}
        previousTextExists={!!previousText}
        isProcessing={isProcessing}
        onStartInstructionRecording={startInstructionRecording}
        onStopInstructionRecording={handleStopInstructionRecording}
        isRecordingInstruction={isRecordingInstruction}
        selectedText={selectedText}
        onStartRephraseRecording={startRephraseRecording}
        onStopRephraseRecording={handleStopRephraseRecording}
        isRecordingRephrase={isRecordingRephrase}
      />

      {isProcessing && <LoadingOverlay />}
      {isRecordingInstruction && <RecordingModal onStop={handleStopInstructionRecording} />}
      {isRecordingRephrase && <RephraseModal onStop={handleStopRephraseRecording} />}
    </div>
  );
};

export default TextEditView;