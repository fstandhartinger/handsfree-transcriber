import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditableText from "@/components/EditableText";
import TextControls from "@/components/TextControls";
import ShareButton from "@/components/ShareButton";
import InstallButton from "@/components/InstallButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TextEditViewProps {
  text: string;
  onBack: () => void;
}

const TextEditView = ({ text: initialText, onBack }: TextEditViewProps) => {
  const [text, setText] = useState(initialText);
  const [isEditMode, setIsEditMode] = useState(false);
  const [previousText, setPreviousText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStyleChange = async (style: string) => {
    try {
      console.log(`Applying ${style} style to text...`);
      setIsProcessing(true);
      setPreviousText(text);

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
    if (previousText) {
      console.log('Undoing text changes');
      setText(previousText);
      setPreviousText(null);
      toast({
        description: "Changes undone",
        duration: 2000,
      });
    }
  };

  const handleStartRephraseRecording = () => {
    console.log('Starting rephrase recording');
    // Implementation will be added later
  };

  const handleStopRephraseRecording = () => {
    console.log('Stopping rephrase recording');
    // Implementation will be added later
  };

  return (
    <div className="min-h-screen flex flex-col p-4 relative">
      <Button
        onClick={onBack}
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 w-10 h-10 p-0 z-50"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <div className="fixed top-4 right-4 z-50">
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
          previousTextExists={!!previousText}
          isProcessing={isProcessing}
          onStartInstructionRecording={() => {}}
          onStopInstructionRecording={() => {}}
          isRecordingInstruction={false}
          selectedText={selectedText}
          onStartRephraseRecording={handleStartRephraseRecording}
          onStopRephraseRecording={handleStopRephraseRecording}
          isRecordingRephrase={false}
          isEditMode={isEditMode}
          onEditModeChange={setIsEditMode}
          onCancel={() => setIsEditMode(false)}
        />
      </div>
    </div>
  );
};

export default TextEditView;