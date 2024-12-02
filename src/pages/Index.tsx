/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast.tsx";
import RecordingView from "@/components/RecordingView";
import TextEditView from "@/components/TextEditView";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Windows app communication interface
const transcriber = {
  StartTranscription: () => {
    // Will be implemented by the page
  },
  StopTranscription: () => {
    // Will be implemented by the page
  },
  IsNewVersionNeeded: (version: number) => {
    // Current version is 1
    return version < 1;
  }
};

const Index = () => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [shouldOfferInstallation, setShouldOfferInstallation] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check URL parameter for installation offer
    const urlParams = new URLSearchParams(window.location.search);
    const offerInstallation = urlParams.get('offerInstallation') !== 'false';
    setShouldOfferInstallation(offerInstallation);

    // Check if app is installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };
    checkInstalled();

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    });

    // Check for updates if in PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }
    }

    // Make transcriber interface available globally
    (window as any).transcriber = transcriber;
  }, []);

  const handleInstallClick = async () => {
    // For Windows, redirect to download page
    if (navigator.platform.includes('Win')) {
      window.location.href = 'https://www.dropbox.com/scl/fi/cfins50r2tv5g7z7j8d80/handsfree-transcriber.exe?rlkey=ezwfmhzr73rhba1ls5fzkb4xt&dl=1';
      return;
    }

    if (!deferredPrompt) return;
    
    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      toast({
        description: "Error installing the app. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      //alert('Starting recording...');
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

      // Notify Windows app that recording started
      const host = (window as any).chrome?.webview?.hostObjects?.transcriberHost;
      if (host?.NotifyTranscriptionStarted) {
        host.NotifyTranscriptionStarted();
      }
      
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

      // Notify Windows app that recording stopped
      const host = (window as any).chrome?.webview?.hostObjects?.transcriberHost;
      if (host?.NotifyTranscriptionStopped) {
        host.NotifyTranscriptionStopped();
      }

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

            // Notify Windows app that text generation is complete
            const host = (window as any).chrome?.webview?.hostObjects?.transcriberHost;
            if (host?.NotifyTextGenerationCompleted) {
              host.NotifyTextGenerationCompleted();
            }
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

  const handleNewRecording = useCallback(() => {
    setTranscribedText(null);
    startRecording();
  }, []);

  // Implement transcriber interface methods
  transcriber.StartTranscription = handleNewRecording;
  transcriber.StopTranscription = stopRecording;

  if (transcribedText) {
    return <TextEditView 
      text={transcribedText} 
      onBack={() => setTranscribedText(null)} 
      onNewRecording={handleNewRecording}
    />;
  }

  const shouldShowInstallButton = !isInstalled && 
    (deferredPrompt || navigator.platform.includes('Win')) && 
    !transcribedText && 
    shouldOfferInstallation;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      {isTranscribing ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-lg">{t('status.transcribing')}</p>
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
      
      {shouldShowInstallButton && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t('buttons.install')}</p>
          <Button
            onClick={handleInstallClick}
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;