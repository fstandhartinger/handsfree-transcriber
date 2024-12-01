import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditableText from "@/components/EditableText";
import TextControls from "@/components/TextControls";
import ShareButton from "@/components/ShareButton";
import InstallButton from "@/components/InstallButton";
import RecordingModal from "@/components/RecordingModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { useAudioProcessing } from "@/hooks/useAudioProcessing";

interface TextEditViewProps {
  text: string;
  onBack: () => void;
}

const TextEditView = ({ text: initialText, onBack }: TextEditViewProps) => {
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
      console.log(`Applying ${style} style to text...`);
      setIsProcessing(true);
      
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

      console.log('Text successfully refined:', data);
      addToHistory(data.text);
      setText(data.text);
      toast({
        description: `Text style updated to ${style}`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating text style:', error);
      toast({
        description: "Error updating text style",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const previousText = textHistory[currentHistoryIndex - 1];
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setText(previousText);
      toast({
        description: "Changes undone",
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
        await processAudioForRephrase(audioBlob);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        description: "Error processing audio",
        variant: "destructive",
      });
    } finally {
      setIsRecordingRephrase(false);
      setIsProcessingRephrase(false);
      setShowRephraseModal(false);
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

  return (
    <div className="min-h-screen flex flex-col p-4 relative">
      <Button
        onClick={onBack}
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 w-10 h-10 p-0"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <div className="fixed top-4 right-4">
        <ShareButton text={text} />
      </div>

      <InstallButton />

      <div className="flex-1 mt-16">
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