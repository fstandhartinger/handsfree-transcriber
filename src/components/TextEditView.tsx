import { ArrowLeft, FileText, MessageSquare, Check, Undo, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TextEditViewProps {
  text: string;
  onBack: () => void;
}

const TextEditView = ({ text, onBack }: TextEditViewProps) => {
  const [currentText, setCurrentText] = useState(text);
  const [previousText, setPreviousText] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStyleChange = (style: string) => {
    // TODO: Implement GPT-4o style changes
    setPreviousText(currentText);
    setCurrentText(`${style} version of: ${currentText}`);
    navigator.clipboard.writeText(currentText);
    toast({
      description: "Updated text copied to clipboard",
      duration: 2000,
    });
  };

  const handleUndo = () => {
    if (previousText) {
      setCurrentText(previousText);
      setPreviousText(null);
      navigator.clipboard.writeText(previousText);
      toast({
        description: "Previous text restored and copied to clipboard",
        duration: 2000,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto p-4">
      <Button
        variant="ghost"
        className="self-start mb-4"
        onClick={onBack}
      >
        <ArrowLeft className="w-6 h-6" />
      </Button>

      <div className="flex-1 bg-white rounded-lg shadow-sm p-4 mb-4 overflow-y-auto">
        <p className="text-lg leading-relaxed">{currentText}</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={() => handleStyleChange("Formal")} className="gap-2">
          <FileText className="w-4 h-4" />
          Formal
        </Button>
        <Button onClick={() => handleStyleChange("Neutral")} className="gap-2">
          <MessageSquare className="w-4 h-4" />
          Neutral
        </Button>
        <Button onClick={() => handleStyleChange("Casual")} className="gap-2">
          <MessageSquare className="w-4 h-4" />
          Casual
        </Button>
        <Button onClick={() => handleStyleChange("Unchanged")} className="gap-2">
          <Check className="w-4 h-4" />
          Unchanged
        </Button>
        {previousText && (
          <Button onClick={handleUndo} variant="outline" className="gap-2">
            <Undo className="w-4 h-4" />
            Undo
          </Button>
        )}
      </div>
    </div>
  );
};

export default TextEditView;