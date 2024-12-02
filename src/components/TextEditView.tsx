import { useState, useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditableText from "@/components/EditableText";
import TextControls from "@/components/TextControls";
import ShareButton, { ClipboardButton } from "@/components/ShareButton";
import InstallButton from "@/components/InstallButton";
import RecordingModal from "@/components/RecordingModal";
import { useToast } from "@/hooks/use-toast.tsx";
import { supabase } from "@/integrations/supabase/client";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { useAudioProcessing } from "@/hooks/useAudioProcessing";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface TextEditViewProps {
  text: string;
  onBack: () => void;
  onNewRecording: () => void;
}

const TextEditView = ({ text: initialText, onBack, onNewRecording }: TextEditViewProps) => {
  const [text, setText] = useState(initialText);
  const [isEditMode, setIsEditMode] = useState(false);
  const [textHistory, setTextHistory] = useState<string[]>([initialText]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [showRephraseModal, setShowRephraseModal] = useState(false);
  const [isRecordingRephrase, setIsRecordingRephrase] = useState(false);
  const [isProcessingRephrase, setIsProcessingRephrase] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

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

  console.log('Rendering TextEditView:', { 
    isProcessing, 
    isProcessingRephrase,
    isEditMode,
    showRephraseModal 
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="h-16 flex items-center justify-between px-4 relative">
        <Button
          onClick={onBack}
          variant="outline"
          size="icon"
          className="w-10 h-10 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        {isProcessing && (
          <div className="absolute left-1/2 -translate-x-1/2 z-50">
            <LoadingSpinner size="md" className="text-primary" />
            <div className="sr-only">Loading indicator should be visible</div>
          </div>
        )}
        
        <div className="flex gap-2">
          <ClipboardButton text={text} />
          <ShareButton text={text} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
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
          onNewRecording={onNewRecording}
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
    </div>
  );
};

export default TextEditView;