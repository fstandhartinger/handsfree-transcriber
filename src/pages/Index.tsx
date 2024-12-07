import { useState, useEffect } from "react";
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
import LegalFooter from "@/components/LegalFooter";

interface IndexProps {
  isAuthenticated: boolean;
}

const Index = ({ isAuthenticated }: IndexProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const { usageCount, incrementUsage } = useUsageCounter();
  const { t } = useTranslation();

  useEffect(() => {
    // Check for pending transcribed text after sign-in
    if (isAuthenticated) {
      const pendingText = localStorage.getItem('pending_transcribed_text');
      if (pendingText) {
        setTranscribedText(pendingText);
        localStorage.removeItem('pending_transcribed_text');
      }
    }
  }, [isAuthenticated]);

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
              const needsAuth = incrementUsage();
              if (needsAuth && !isAuthenticated) {
                // The auth dialog will be shown in TextEditView
                localStorage.setItem('needs_auth', 'true');
              }
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
      console.error('Error accessing microphone:', error);
      toast({
        description: t('errors.microphoneAccess'),
        variant: "destructive",
      });
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

  return (
    <div className="h-screen flex flex-col">
      {transcribedText ? (
        <TextEditView
          text={transcribedText}
          onBack={() => {
            setTranscribedText(null);
            setIsRecording(false);
          }}
          onNewRecording={() => {
            setTranscribedText(null);
            handleStartRecording();
          }}
          isAuthenticated={isAuthenticated}
        />
      ) : (
        <>
          <div className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <ProfileButton />
          </div>

          <div className="flex-1 flex flex-col items-center justify-start px-4">
            <div className="text-center mt-16 mb-12">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent tracking-tight">
                Speech to Text PRO
              </h1>
              <p className="text-lg font-medium text-foreground/90">
                {t('landing.headline')}
              </p>
            </div>

            <div className="flex flex-col items-center min-h-[180px] justify-center mb-16">
              <p className="text-sm font-medium text-primary/90 mb-6 animate-pulse">
                {t('landing.tryFree')}
              </p>
              <div className="h-[120px] flex items-center justify-center">
                {isTranscribing ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground">{t('status.transcribing')}</p>
                  </div>
                ) : isRecording ? (
                  <RecordingView
                    onStop={() => {
                      if (mediaRecorder && mediaStream) {
                        mediaRecorder.stop();
                        mediaStream.getTracks().forEach(track => track.stop());
                      }
                    }}
                  />
                ) : (
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary/90 hover:bg-primary"
                    onClick={handleStartRecording}
                    disabled={isTranscribing}
                  >
                    <Mic className="w-8 h-8" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto px-4">
              {/* Fast */}
              <div className="group relative bg-background hover:bg-muted/50 rounded-xl p-3 transition-all duration-200 border border-border/50 hover:border-primary/20 h-[100px] flex">
                <div className="flex flex-col items-center text-center space-y-2 w-full justify-center">
                  <span className="text-base font-medium group-hover:scale-110 transition-transform duration-200">
                    {t('features.fast.title')}
                  </span>
                  <p className="text-xs text-muted-foreground/70 group-hover:text-foreground/80 transition-colors duration-200">
                    {t('features.fast.description')}
                  </p>
                </div>
              </div>

              {/* Smart */}
              <div className="group relative bg-background hover:bg-muted/50 rounded-xl p-3 transition-all duration-200 border border-border/50 hover:border-primary/20 h-[100px] flex">
                <div className="flex flex-col items-center text-center space-y-2 w-full justify-center">
                  <span className="text-base font-medium group-hover:scale-110 transition-transform duration-200">
                    {t('features.ai.title')}
                  </span>
                  <p className="text-xs text-muted-foreground/70 group-hover:text-foreground/80 transition-colors duration-200">
                    {t('features.ai.description')}
                  </p>
                </div>
              </div>

              {/* Simple */}
              <div className="group relative bg-background hover:bg-muted/50 rounded-xl p-3 transition-all duration-200 border border-border/50 hover:border-primary/20 h-[100px] flex">
                <div className="flex flex-col items-center text-center space-y-2 w-full justify-center">
                  <span className="text-base font-medium group-hover:scale-110 transition-transform duration-200">
                    {t('features.simple.title')}
                  </span>
                  <p className="text-xs text-muted-foreground/70 group-hover:text-foreground/80 transition-colors duration-200">
                    {t('features.simple.description')}
                  </p>
                </div>
              </div>

              {/* Reliable */}
              <div className="group relative bg-background hover:bg-muted/50 rounded-xl p-3 transition-all duration-200 border border-border/50 hover:border-primary/20 h-[100px] flex">
                <div className="flex flex-col items-center text-center space-y-2 w-full justify-center">
                  <span className="text-base font-medium group-hover:scale-110 transition-transform duration-200">
                    {t('features.reliable.title')}
                  </span>
                  <p className="text-xs text-muted-foreground/70 group-hover:text-foreground/80 transition-colors duration-200">
                    {t('features.reliable.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <CookieBanner />
          <LegalFooter />
        </>
      )}

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
};

export default Index;