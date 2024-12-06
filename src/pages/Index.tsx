import { useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import RecordingView from "@/components/RecordingView";
import TextEditView from "@/components/TextEditView";
import { SettingsDialog } from "@/components/SettingsDialog";
import AuthDialog from "@/components/AuthDialog";
import { useUsageCounter } from "@/hooks/useUsageCounter";
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

interface IndexProps {
  isAuthenticated: boolean;
}

const Index = ({ isAuthenticated }: IndexProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { usageCount, incrementUsage, maxFreeUses } = useUsageCounter();
  const { toast } = useToast();

  // Add error logging for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    if (event === 'SIGNED_IN') {
      console.log('User signed in successfully');
    }
    if (event === 'SIGNED_OUT') {
      console.log('User signed out');
    }
    if (event === 'USER_UPDATED') {
      console.log('User was updated');
    }
    // Log any auth errors
    if (session?.error) {
      console.error('Auth error:', session.error);
      toast({
        description: "Bei der Anmeldung ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    }
  });

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
        try {
          // Stop all tracks in the stream to clear the recording indicator
          stream.getTracks().forEach(track => track.stop());
          
          const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const audioDataUri = base64Audio.split(',')[1];
            
            try {
              setIsTranscribing(true);
              const { data, error } = await supabase.functions.invoke('transcribe', {
                body: { audioDataUri },
              });

              if (error) throw error;
              
              setTranscribedText(data.transcription);
            } catch (error) {
              console.error('Transcription error:', error);
              toast({
                description: "Fehler bei der Transkription. Bitte versuchen Sie es erneut.",
                variant: "destructive",              
              });
            } finally {
              setIsTranscribing(false);
              setIsRecording(false);
            }
          };

          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Error processing audio:', error);
          toast({
            description: "Fehler bei der Audioverarbeitung. Bitte versuchen Sie es erneut.",
            variant: "destructive",
          });
          setIsTranscribing(false);
          setIsRecording(false);
        }
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        description: "Zugriff auf das Mikrofon nicht möglich. Bitte überprüfen Sie die Berechtigungen.",
        variant: "destructive",
      });
      setIsRecording(false);
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
            <p className="text-lg">Transkribiere...</p>
          </div>
        ) : isRecording ? (
          <RecordingView onStop={async () => {
            setIsRecording(false);
            setIsTranscribing(true);
          }} />
        ) : (
          <div className="flex flex-col items-center gap-4">
            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground">
                Noch {maxFreeUses - usageCount} kostenlose Versuche übrig
              </p>
            )}
            <Button
              onClick={handleStartRecording}
              size="lg"
              className="w-16 h-16 rounded-full"
            >
              <Mic className="w-8 h-8" />
            </Button>
          </div>
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