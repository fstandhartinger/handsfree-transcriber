import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditableText from "@/components/EditableText";
import TextControls from "@/components/TextControls";
import ShareButton from "@/components/ShareButton";

interface TextEditViewProps {
  text: string;
  onBack: () => void;
}

const TextEditView = ({ text: initialText, onBack }: TextEditViewProps) => {
  const [text, setText] = useState(initialText);
  const [isEditMode, setIsEditMode] = useState(false);

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

      <div className="flex-1 mt-16">
        <EditableText 
          text={text} 
          onChange={setText} 
          isEditMode={isEditMode}
          onEditModeChange={setIsEditMode}
        />
        <TextControls 
          onStyleChange={() => {}} 
          onUndo={() => {}} 
          previousTextExists={false}
          isProcessing={false}
          onStartInstructionRecording={() => {}}
          onStopInstructionRecording={() => {}}
          isRecordingInstruction={false}
          selectedText={null}
          onStartRephraseRecording={() => {}}
          onStopRephraseRecording={() => {}}
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