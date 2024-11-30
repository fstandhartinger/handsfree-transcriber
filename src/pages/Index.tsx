import { useState, useRef, useCallback } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import RecordingView from "@/components/RecordingView";
import TextEditView from "@/components/TextEditView";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
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
      setIsRecording(true);
      
      console.log('Recording started');
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
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);

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
            navigator.clipboard.writeText(data.transcription);
            toast({
              description: "Text copied to clipboard",
              duration: 2000,
              className: "top-0 right-0 fixed mt-4 mr-4 text-sm py-2 px-3 max-w-[50vw] w-auto",
            });
          } catch (error) {
            console.error('Transcription error:', error);
            toast({
              description: "Error transcribing audio. Please try again.",
              variant: "destructive",
              className: "top-0 right-0 fixed mt-4 mr-4 max-w-[50vw] w-auto",
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
        className: "top-0 right-0 fixed mt-4 mr-4 max-w-[50vw] w-auto",
      });
    }
  }, [toast]);

  if (transcribedText) {
    return <TextEditView text={transcribedText} onBack={() => setTranscribedText(null)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
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