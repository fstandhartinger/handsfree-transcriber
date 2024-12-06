import { useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import RecordingView from "@/components/RecordingView";
import TextEditView from "@/components/TextEditView";
import { SettingsDialog } from "@/components/SettingsDialog";
import AuthDialog from "@/components/AuthDialog";
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
  const { toast } = useToast();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

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
    const error = (session as unknown as { error?: AuthError })?.error;
    if (error) {
      console.error('Auth error:', error);
      toast({
        description: "Bei der Anmeldung ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    }
  });

  const handleStartRecording = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaStream(stream);
      setMediaRecorder(recorder);
      let audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.start();
      setIsRecording(true);

      recorder.onstop = async () => {
        try {
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

  const handleStopRecording = () => {
    if (mediaRecorder && mediaStream) {
      mediaRecorder.stop();
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaRecorder(null);
      setMediaStream(null);
      setIsTranscribing(true);
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
          <RecordingView onStop={handleStopRecording} />
        ) : (
          <div className="flex flex-col items-center gap-4">
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