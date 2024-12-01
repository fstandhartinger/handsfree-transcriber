import { useState, useRef, useCallback } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import RecordingView from "@/components/RecordingView";
import TextEditView from "@/components/TextEditView";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      console.log('Starting recording...');
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
      setIsRecording(true);
      
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return;

    try {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);

      // Clean up the media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('Audio track stopped:', track.label);
        });
        streamRef.current = null;
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          const audioDataUri = base64Audio.split(',')[1];
          
          try {
            const { data, error } = await supabase.functions.invoke('transcribe', {
              body: { audioDataUri },
            });

            if (error) throw error;
            
            setTranscribedText(data.transcription);
          } catch (error) {
            console.error('Transcription error:', error);
            toast({
              description: "Error transcribing audio. Please try again.",
              variant: "destructive",              
            });
          } finally {
            setIsTranscribing(false);
          }
        };

        reader.readAsDataURL(audioBlob);
      };
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsTranscribing(false);
      toast({
        description: "Error processing audio. Please try again.",
        variant: "destructive",        
      });
    }
  }, [toast]);

  if (transcribedText) {
    return <TextEditView text={transcribedText} onBack={() => setTranscribedText(null)} />;
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      {isTranscribing ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-lg">Transcribing...</p>
        </div>
      ) : isRecording ? (
        <RecordingView onStop={stopRecording} />
      ) : (
        <Button
          onClick={startRecording}
          size="lg"
          className="w-16 h-16 rounded-full"
        >
          <Mic className="w-8 h-8" />
        </Button>
      )}
    </div>
  );
};

export default Index;