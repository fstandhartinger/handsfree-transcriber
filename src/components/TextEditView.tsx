import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RecordingModal from "./RecordingModal";
import LoadingOverlay from "./LoadingOverlay";
import TextControls from "./TextControls";
import EditableText from "./EditableText";
import { useAudioRecording } from "./hooks/useAudioRecording";

interface TextEditViewProps {
  text: string;
  onBack: () => void;
}

const TextEditView = ({ text, onBack }: TextEditViewProps) => {
  const [currentText, setCurrentText] = useState(text);
  const [previousText, setPreviousText] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { isRecording, startRecording, stopRecording } = useAudioRecording();

  const handleStyleChange = async (style: string) => {
    try {
      console.log('Starting style change:', style);
      setIsProcessing(true);
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
        className: "top-0 right-0 fixed mt-4 mr-4 text-sm py-2 px-3 max-w-[50vw] w-auto",
      });
    } catch (error) {
      console.error('Style change error:', error);
      toast({
        description: error instanceof Error ? error.message : "Error updating text style",
        variant: "destructive",
        className: "top-0 right-0 fixed mt-4 mr-4 max-w-[50vw] w-auto",
      });
    } finally {
      setIsProcessing(false);
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
        className: "top-0 right-0 fixed mt-4 mr-4",
      });
    }
  };

  const handleStopInstructionRecording = async () => {
    try {
      setIsProcessing(true);
      const audioBlob = await stopRecording();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const audioDataUri = base64Audio.split(',')[1];
        
        try {
          const { data: transcriptionData, error: transcriptionError } = 
            await supabase.functions.invoke('transcribe', {
              body: { audioDataUri },
            });

          if (transcriptionError) throw transcriptionError;

          const { data: refinementData, error: refinementError } = 
            await supabase.functions.invoke('refine-text', {
              body: {
                text: currentText,
                instruction: transcriptionData.transcription,
                selectedText: selectedText,
              },
            });

          if (refinementError) throw refinementError;

          setPreviousText(currentText);
          setCurrentText(refinementData.text);
          setSelectedText(null);
          navigator.clipboard.writeText(refinementData.text);
          toast({
            description: "Text updated and copied to clipboard",
            duration: 2000,
          });
        } catch (error) {
          console.error('Text refinement error:', error);
          toast({
            description: "Error processing instruction. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsProcessing(false);
      toast({
        description: "Error processing audio. Please try again.",
        variant: "destructive",
      });
    }
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
        onStartInstructionRecording={startRecording}
        onStopInstructionRecording={handleStopInstructionRecording}
        isRecordingInstruction={isRecording}
        selectedText={selectedText}
      />

      {isProcessing && <LoadingOverlay />}
      {isRecording && <RecordingModal onStop={handleStopInstructionRecording} />}
    </div>
  );
};

export default TextEditView;