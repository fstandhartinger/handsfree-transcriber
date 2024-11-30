import { useState } from "react";
import { ArrowLeft, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditableText from "@/components/EditableText";
import TextControls from "@/components/TextControls";
import ShareButton from "@/components/ShareButton";
import { useToast } from "@/hooks/use-toast";

interface TextEditViewProps {
  text: string;
  onBack: () => void;
}

const TextEditView = ({ text: initialText, onBack }: TextEditViewProps) => {
  const [text, setText] = useState(initialText);
  const { toast } = useToast();

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        description: "Text copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        description: "Error copying to clipboard",
        variant: "destructive",
      });
    }
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
      
      <div className="fixed top-4 right-4 flex gap-2">
        <Button
          onClick={handleCopyToClipboard}
          variant="outline"
          size="icon"
          className="w-10 h-10 p-0"
        >
          <ClipboardCopy className="h-4 w-4" />
        </Button>
        <ShareButton text={text} />
      </div>

      <div className="flex-1 mt-16">
        <EditableText text={text} onChange={setText} />
        <TextControls text={text} onTextChange={setText} />
      </div>
    </div>
  );
};

export default TextEditView;