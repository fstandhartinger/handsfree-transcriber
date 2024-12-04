/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import RecordingView from "@/components/RecordingView";
import TextEditView from "@/components/TextEditView";
import { SettingsDialog } from "@/components/SettingsDialog";
import AuthDialog from "@/components/AuthDialog";
import { useUsageCounter } from "@/hooks/useUsageCounter";

interface IndexProps {
  isAuthenticated: boolean;
}

const Index = ({ isAuthenticated }: IndexProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { incrementUsage } = useUsageCounter();
  const { toast } = useToast();

  const handleStartRecording = async () => {
    if (!isAuthenticated && incrementUsage()) {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      let audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
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
      console.error('Error starting recording:', error);
      toast({
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  if (transcribedText) {
    return <TextEditView 
      text={transcribedText} 
      onBack={() => setTranscribedText(null)} 
      onNewRecording={() => setTranscribedText(null)}
    />;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center">
        {isTranscribing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-lg">Transcribing...</p>
          </div>
        ) : isRecording ? (
          <RecordingView onStop={async () => {
            setIsRecording(false);
            setIsTranscribing(true);
          }} />
        ) : (
          <Button
            onClick={handleStartRecording}
            size="lg"
            className="w-16 h-16 rounded-full"
          >
            <Mic className="w-8 h-8" />
          </Button>
        )}
      </div>
      <SettingsDialog 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />
    </div>
  );
};

export default Index;
