import { ArrowLeft, FileText, MessageSquare, Undo, Mic, Strikethrough } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RecordingModal from "./RecordingModal";
import LoadingOverlay from "./LoadingOverlay";
import TextControls from "./TextControls";
import EditableText from "./EditableText";

interface TextEditViewProps {
  text: string;
  onBack: () => void;
}

const TextEditView = ({ text, onBack }: TextEditViewProps) => {
  const [currentText, setCurrentText] = useState(text);
  const [previousText, setPreviousText] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isRecordingInstruction, setIsRecordingInstruction] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleStyleChange = async (style: string) => {
    try {
      console.log('Starting style change:', style);
      setIsProcessing(true);
      setPreviousText(currentText);

      const { data, error } = await supabase.functions.invoke('refine-text', {
        body: { text: currentText, style: style.toLowerCase() },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Failed to refine text: ${error.message}`);
      }

      if (!data || !data.text) {
        console.error('Invalid response data:', data);
        throw new Error('Invalid response from text refinement service');
      }

      console.log('Style change successful:', data);
      setCurrentText(data.text);
      navigator.clipboard.writeText(data.text);
      toast({
        description: "Updated text copied to clipboard",
        duration: 2000,
        className: "top-0 right-0 fixed mt-4 mr-4 text-sm py-2 px-3",
      });
    } catch (error) {
      console.error('Style change error:', error);
      toast({
        description: error instanceof Error ? error.message : "Error updating text style. Please try again.",
        variant: "destructive",
        className: "top-0 right-0 fixed mt-4 mr-4",
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

  const startInstructionRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecordingInstruction(true);
    } catch (error) {
      console.error('Error starting instruction recording:', error);
      toast({
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopInstructionRecording = async () => {
    if (!mediaRecorderRef.current) return;

    try {
      mediaRecorderRef.current.stop();
      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecordingInstruction(false);
      setIsProcessing(true);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          const audioDataUri = base64Audio.split(',')[1];
          
          try {
            // First transcribe the instruction
            const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('transcribe', {
              body: { audioDataUri },
            });

            if (transcriptionError) throw transcriptionError;

            // Then use the transcribed instruction to refine the text
            const { data: refinementData, error: refinementError } = await supabase.functions.invoke('refine-text', {
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
      };
    } catch (error) {
      console.error('Error stopping instruction recording:', error);
      setIsProcessing(false);
      setIsRecordingInstruction(false);
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
        onStartInstructionRecording={startInstructionRecording}
        onStopInstructionRecording={stopInstructionRecording}
        isRecordingInstruction={isRecordingInstruction}
        selectedText={selectedText}
      />

      {isProcessing && <LoadingOverlay />}
      {isRecordingInstruction && <RecordingModal onStop={stopInstructionRecording} />}
    </div>
  );
};

export default TextEditView;