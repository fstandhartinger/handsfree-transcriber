/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditableText from "@/components/EditableText";
import TextControls from "@/components/TextControls";
import ShareButton, { ClipboardButton } from "@/components/ShareButton";
import RecordingModal from "@/components/RecordingModal";
import { useToast } from "@/hooks/use-toast.tsx";
import { supabase } from "@/integrations/supabase/client";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { useAudioProcessing } from "@/hooks/useAudioProcessing";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAutoCopyToClipboard } from "@/components/SettingsDialog";
import { useUsageCounter } from "@/hooks/useUsageCounter";
import AuthDialog from "@/components/AuthDialog";

interface TextEditViewProps {
  text: string;
  onBack: () => void;
  onNewRecording: () => void;
  isAuthenticated: boolean;
}

const TextEditView = ({ text: initialText, onBack, onNewRecording, isAuthenticated }: TextEditViewProps) => {
  const [text, setText] = useState(initialText);
  const [isEditMode, setIsEditMode] = useState(false);
  const [textHistory, setTextHistory] = useState<string[]>([initialText]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [showRephraseModal, setShowRephraseModal] = useState(false);
  const [isRecordingRephrase, setIsRecordingRephrase] = useState(false);
  const [isProcessingRephrase, setIsProcessingRephrase] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const [autoCopy] = useAutoCopyToClipboard();
  const [hasInitialCopyBeenTriggered, setHasInitialCopyBeenTriggered] = useState(false);
  const { incrementUsage } = useUsageCounter();

  // Check for needs_auth flag when component mounts
  useEffect(() => {
    const needsAuth = localStorage.getItem('needs_auth');
    if (needsAuth === 'true' && !isAuthenticated) {
      console.log('Needs auth flag found, showing auth dialog');
      // Small delay to ensure text is rendered
      setTimeout(() => {
        setShowAuthDialog(true);
        localStorage.removeItem('needs_auth');
      }, 100);
    }
  }, [isAuthenticated]);

  // Function to copy text to clipboard
  const copyToClipboard = useCallback(async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        description: t('toasts.textCopied'),
        duration: 2000,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        description: t('toasts.clipboardError'),
        variant: "destructive",
      });
    }
  }, [t, toast]);

  // Auto-copy only when authenticated
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] Auto-copy check - autoCopy: ${autoCopy}, showAuthDialog: ${showAuthDialog}, isAuthenticated: ${isAuthenticated}`);
    if (autoCopy && text !== initialText && !showAuthDialog && isAuthenticated) {
      copyToClipboard(text);
    }
  }, [text, autoCopy, initialText, copyToClipboard, showAuthDialog, isAuthenticated]);

  // Handle initial text copy only when authenticated
  useEffect(() => {
    if (autoCopy && !hasInitialCopyBeenTriggered && !showAuthDialog && isAuthenticated) {
      copyToClipboard(initialText);
      setHasInitialCopyBeenTriggered(true);
    }
  }, [autoCopy, initialText, hasInitialCopyBeenTriggered, copyToClipboard, showAuthDialog, isAuthenticated]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('Processing state changed:', { isProcessing });
  }, [isProcessing]);

  const { isRecording, startRecording, stopRecording } = useAudioRecording();
  const { processAudioForRephrase } = useAudioProcessing(text, (newText: string) => {
    addToHistory(newText);
    setText(newText);
  }, setText);

  const addToHistory = (newText: string) => {
    const newHistory = textHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(newText);
    setTextHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    setText(newText);
  };

  const handleStyleChange = async (style: string) => {
    try {
      console.log('Style change started:', { style, text });
      setIsProcessing(true);
      console.log('Processing state set to true');
      
      console.log('Calling Supabase function with:', {
        text,
        instruction: `Make this text more ${style.toLowerCase()}`
      });
      
      const { data, error } = await supabase.functions.invoke('refine-text', {
        body: {
          text: text,
          instruction: `Make this text more ${style.toLowerCase()}`,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Supabase response:', { data });
      addToHistory(data.text);
      setText(data.text);

      // Notify Windows app that text generation is complete
      const host = (window as any).chrome?.webview?.hostObjects?.transcriberHost;
      if (host?.NotifyTextGenerationCompleted) {
        host.NotifyTextGenerationCompleted();
      }

      toast({
        description: t('toasts.styleUpdated', { style: t(`buttons.${style.toLowerCase()}`) }),
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating text style:', error);
      toast({
        description: t('toasts.styleUpdateError'),
        variant: "destructive",
      });
    } finally {
      console.log('Style change completed, setting processing to false');
      setIsProcessing(false);
    }
  };

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const previousText = textHistory[currentHistoryIndex - 1];
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setText(previousText);
      toast({
        description: t('toasts.changesUndone'),
        duration: 2000,
      });
    }
  };

  const handleStartRephraseRecording = () => {
    console.log('Starting rephrase recording');
    setShowRephraseModal(true);
  };

  const handleStopRephraseRecording = async () => {
    console.log('Stopping rephrase recording');
    try {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        setIsProcessingRephrase(true);
        setIsRecordingRephrase(false);
        await processAudioForRephrase(audioBlob);

        // Notify Windows app that text generation is complete
        const host = (window as any).chrome?.webview?.hostObjects?.transcriberHost;
        if (host?.NotifyTextGenerationCompleted) {
          host.NotifyTextGenerationCompleted();
        }

        setShowRephraseModal(false);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        description: t('toasts.audioProcessingError'),
        variant: "destructive",
      });
    } finally {
      setIsProcessingRephrase(false);
    }
  };

  const handleStartRecording = async () => {
    console.log('Starting actual recording');
    setIsRecordingRephrase(true);
    await startRecording();
  };

  const handleCancelRecording = () => {
    setShowRephraseModal(false);
    setIsRecordingRephrase(false);
    setIsProcessingRephrase(false);
  };

  const handleNewRecording = () => {
    console.log(`[${new Date().toISOString()}] Starting new recording`);
    const needsAuth = incrementUsage();
    if (needsAuth && !isAuthenticated) {
      console.log('Needs auth flag found, setting needs_auth in localStorage in handleNewRecording');
      localStorage.setItem('needs_auth', 'true');
    }
    onNewRecording();
  };

  console.log(`[${new Date().toISOString()}] Rendering TextEditView:`, { 
    isProcessing, 
    isProcessingRephrase,
    isEditMode,
    showRephraseModal,
    showAuthDialog,
    textLength: text.length,
    initialTextLength: initialText.length
  });

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 h-14 bg-background">
        <Button
          onClick={onBack}
          variant="outline"
          size="icon"
          className="w-10 h-10 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        {isProcessing && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <LoadingSpinner size="md" className="text-primary" />
            <div className="sr-only">Loading indicator should be visible</div>
          </div>
        )}
        
        <div className="flex gap-2">
          <ClipboardButton text={text} />
          {!(window as any).chrome?.webview?.hostObjects?.transcriberHost && (
            <ShareButton text={text} />
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <EditableText 
          text={text} 
          onChange={setText} 
          onTextSelect={setSelectedText}
          isEditMode={isEditMode}
          onEditModeChange={setIsEditMode}
        />
        <TextControls 
          onStyleChange={handleStyleChange}
          onUndo={handleUndo}
          previousTextExists={currentHistoryIndex > 0}
          isProcessing={isProcessing}
          onStartInstructionRecording={() => {}}
          onStopInstructionRecording={() => {}}
          isRecordingInstruction={false}
          selectedText={selectedText}
          onStartRephraseRecording={handleStartRephraseRecording}
          onStopRephraseRecording={handleStopRephraseRecording}
          isRecordingRephrase={isRecordingRephrase}
          isEditMode={isEditMode}
          onEditModeChange={setIsEditMode}
          onCancel={() => setIsEditMode(false)}
          onNewRecording={handleNewRecording}
        />
      </div>

      {showRephraseModal && (
        <RecordingModal
          onStop={handleStopRephraseRecording}
          selectedText={selectedText}
          mode="rephrase"
          isRecording={isRecordingRephrase}
          onStartRecording={handleStartRecording}
          onCancel={handleCancelRecording}
          isProcessing={isProcessingRephrase}
        />
      )}

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        text={text} 
      />
    </div>
  );
};

export default TextEditView;