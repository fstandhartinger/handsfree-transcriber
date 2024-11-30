import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAudioProcessing = (
  currentText: string, 
  addToHistory: (text: string) => void,
  setCurrentText: (text: string) => void
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processAudioForRephrase = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
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

          toast({
            description: `Verstanden: "${transcriptionData.transcription}"`,
            duration: 4000,
          });

          const { data: refinementData, error: refinementError } = 
            await supabase.functions.invoke('refine-text', {
              body: {
                text: currentText,
                instruction: `Rephrase this text according to these instructions: ${transcriptionData.transcription}`,
              },
            });

          if (refinementError) throw refinementError;

          addToHistory(refinementData.text);
          setCurrentText(refinementData.text);
          navigator.clipboard.writeText(refinementData.text);
          toast({
            description: "Text rephrased and copied to clipboard",
            duration: 2000,
          });
        } catch (error) {
          console.error('Text rephrasing error:', error);
          toast({
            description: "Error processing rephrasing. Please try again.",
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

  const processAudioForInstruction = async (audioBlob: Blob, selectedText: string | null) => {
    try {
      setIsProcessing(true);
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

          addToHistory(refinementData.text);
          setCurrentText(refinementData.text);
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

  return {
    isProcessing,
    processAudioForRephrase,
    processAudioForInstruction
  };
};