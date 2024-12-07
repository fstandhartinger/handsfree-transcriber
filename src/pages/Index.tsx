import { useState } from "react";
import { Mic, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import RecordingView from "@/components/RecordingView";
import TextEditView from "@/components/TextEditView";
import { SettingsDialog } from "@/components/SettingsDialog";
import AuthDialog from "@/components/AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";
import { useUsageCounter } from "@/hooks/useUsageCounter";
import { useTranslation } from "react-i18next";
import { CookieBanner } from "@/components/CookieBanner";
import UpdateNotification from "@/components/UpdateNotification";
import ProfileButton from "@/components/ProfileButton";

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
  const { usageCount, incrementUsage } = useUsageCounter();
  const { t } = useTranslation();

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
    const needsAuth = incrementUsage();
    
    if (needsAuth && !isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaStream(stream);
      setMediaRecorder(recorder);
      const audioChunks: Blob[] = [];

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
                description: t('errors.transcription'),
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
            description: t('errors.audioProcessing'),
            variant: "destructive",
          });
          setIsTranscribing(false);
          setIsRecording(false);
        }
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        description: t('errors.microphoneAccess'),
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
      onNewRecording={() => {
        setTranscribedText(null);
        handleStartRecording();
      }}
    />;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="h-16 flex items-center justify-between px-4 fixed top-0 w-full bg-background z-50">
        <div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="h-10 w-10 flex items-center justify-center"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <SettingsDialog 
            open={showSettings} 
            onOpenChange={setShowSettings} 
          />
        </div>
        <ProfileButton />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pt-16">
        {isTranscribing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-lg">{t('status.transcribing')}</p>
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

      <div className="relative z-30">
        <UpdateNotification />
      </div>

      <div className="legal-links fixed bottom-0 left-0 w-full p-2 bg-background">
        <div className="flex justify-center gap-6 mb-2">
          <a href="/terms-and-conditions" target="_blank" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('footer.terms')}</a>
          <a href="/data-privacy" target="_blank" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('footer.privacy')}</a>
          <a href="/imprint" target="_blank" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('footer.imprint')}</a>
        </div>
        <CookieBanner />
      </div>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />
    </div>
  );
};

export default Index;