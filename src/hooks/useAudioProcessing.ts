import { useState } from "react";
import { useToast } from "@/hooks/use-toast.tsx";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export const useAudioProcessing = (
  currentText: string, 
  addToHistory: (text: string) => void,
  setCurrentText: (text: string) => void
) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const processAudioForRephrase = async (audioBlob: Blob) => {
    return new Promise<void>((resolve, reject) => {
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
            description: `${t('toasts.understood')}: "${transcriptionData.transcription}"`,
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
          toast({
            description: t('toasts.textRephrased'),
            duration: 2000,
          });
          resolve();
        } catch (error) {
          console.error('Text rephrasing error:', error);
          toast({
            description: t('toasts.rephrasingError'),
            variant: "destructive",
          });
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(reader.error);
      };

      reader.readAsDataURL(audioBlob);
    });
  };

  const processNewRecording = async (audioBlob: Blob) => {
    return new Promise<void>((resolve, reject) => {
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

          addToHistory(transcriptionData.transcription);
          setCurrentText(transcriptionData.transcription);
          resolve();
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            description: t('toasts.transcriptionError'),
            variant: "destructive",
          });
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(reader.error);
      };

      reader.readAsDataURL(audioBlob);
    });
  };

  return {
    processAudioForRephrase,
    processNewRecording
  };
};