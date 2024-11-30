import { ArrowLeft, FileText, MessageSquare, Check, Undo, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

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
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleStyleChange = async (style: string) => {
    try {
      setIsProcessing(true);
      setPreviousText(currentText);

      const { data, error } = await supabase.functions.invoke('refine-text', {
        body: { text: currentText, style: style.toLowerCase() },
      });

      if (error) throw error;

      setCurrentText(data.text);
      navigator.clipboard.writeText(data.text);
      toast({
        description: "Updated text copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      console.error('Style change error:', error);
      toast({
        description: "Error updating text style. Please try again.",
        variant: "destructive",
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
      });
    }
  };

  const startInstructionRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

      <ScrollArea className="flex-1 bg-white rounded-lg shadow-sm p-4 mb-4">
        <p 
          className="text-lg leading-relaxed"
          onMouseUp={() => {
            const selection = window.getSelection();
            if (selection && selection.toString()) {
              setSelectedText(selection.toString());
            }
          }}
        >
          {currentText}
        </p>
      </ScrollArea>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button 
          onClick={() => handleStyleChange("Formal")} 
          className="gap-2"
          disabled={isProcessing}
        >
          <FileText className="w-4 h-4" />
          Formal
        </Button>
        <Button 
          onClick={() => handleStyleChange("Neutral")} 
          className="gap-2"
          disabled={isProcessing}
        >
          <MessageSquare className="w-4 h-4" />
          Neutral
        </Button>
        <Button 
          onClick={() => handleStyleChange("Casual")} 
          className="gap-2"
          disabled={isProcessing}
        >
          <MessageSquare className="w-4 h-4" />
          Casual
        </Button>
        <Button 
          onClick={() => handleStyleChange("Unchanged")} 
          className="gap-2"
          disabled={isProcessing}
        >
          <Check className="w-4 h-4" />
          Unchanged
        </Button>
        {previousText && (
          <Button 
            onClick={handleUndo} 
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
            onClick={isRecordingInstruction ? stopInstructionRecording : startInstructionRecording}
            variant="secondary"
            className="gap-2"
            disabled={isProcessing}
          >
            <Mic className="w-4 h-4" />
            {isRecordingInstruction ? "Stop" : "Correct Selection"}
          </Button>
        )}
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-center">Processing...</p>
          </div>
        </div>
      )}

      {isRecordingInstruction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center recording-pulse mb-4 mx-auto">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
            <p className="text-center mb-4">Speak your correction instructions...</p>
            <Button
              onClick={stopInstructionRecording}
              variant="outline"
              size="lg"
              className="rounded-full w-16 h-16 mx-auto block"
            >
              <StopCircle className="w-8 h-8" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEditView;