import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareButton, { ClipboardButton } from "@/components/ShareButton";
import TextControls from "@/components/TextControls";
import EditableText from "@/components/EditableText";
import LoadingOverlay from "@/components/LoadingOverlay";
import AuthDialog from "@/components/AuthDialog";
import { useToast } from "@/hooks/use-toast";
import ProfileButton from "@/components/ProfileButton";

interface TextEditViewProps {
  text: string;
  onBack: () => void;
  onNewRecording: () => void;
  isAuthenticated: boolean;
}

const TextEditView = ({
  text: initialText,
  onBack,
  onNewRecording,
  isAuthenticated,
}: TextEditViewProps) => {
  const [text, setText] = useState(initialText);
  const [previousTexts, setPreviousTexts] = useState<string[]>([initialText]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingRephrase, setIsProcessingRephrase] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showRephraseModal, setShowRephraseModal] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log("[" + new Date().toISOString() + "] Rendering TextEditView:", {
      isProcessing,
      isProcessingRephrase,
      isEditMode,
      showRephraseModal,
      showAuthDialog,
      text: text.substring(0, 50) + "...",
    });
  }, [isProcessing, isProcessingRephrase, isEditMode, showRephraseModal, showAuthDialog, text]);

  const handleProcessingStateChange = (state: { isProcessing: boolean }) => {
    console.log("Processing state changed:", state);
    setIsProcessing(state.isProcessing);
  };

  const handleTextChange = (newText: string) => {
    setPreviousTexts((prev) => [...prev, text]);
    setText(newText);
  };

  const handleUndo = () => {
    if (previousTexts.length > 1) {
      const previousText = previousTexts[previousTexts.length - 1];
      setPreviousTexts((prev) => prev.slice(0, -1));
      setText(previousText);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <ClipboardButton text={text} />
          <ShareButton text={text} />
          <ProfileButton />
        </div>
      </div>

      <div className="flex-1 relative">
        <EditableText
          text={text}
          onChange={handleTextChange}
          isEditMode={isEditMode}
          onEditModeChange={setIsEditMode}
        />

        {(isProcessing || isProcessingRephrase) && <LoadingOverlay />}
      </div>

      <TextControls
        onStyleChange={() => {}}
        onUndo={handleUndo}
        previousTextExists={previousTexts.length > 1}
        isProcessing={isProcessing}
        onStartInstructionRecording={() => {}}
        onStopInstructionRecording={() => {}}
        isRecordingInstruction={false}
        selectedText={null}
        onStartRephraseRecording={() => {}}
        onStopRephraseRecording={() => {}}
        isRecordingRephrase={isProcessingRephrase}
        isEditMode={isEditMode}
        onEditModeChange={setIsEditMode}
        onNewRecording={onNewRecording}
      />

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />
    </div>
  );
};

export default TextEditView;