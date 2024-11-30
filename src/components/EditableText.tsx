import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditableTextProps {
  text: string;
  onChange: (newText: string) => void;
  onTextSelect?: (selectedText: string | null) => void;
}

const EditableText = ({ text, onChange, onTextSelect }: EditableTextProps) => {
  const { toast } = useToast();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Text copied to clipboard",
      duration: 2000,
      className: "top-0 right-0 fixed mt-4 mr-4 text-sm py-2 px-3 max-w-[50vw] w-auto",
    });
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    const selectedText = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    );
    onTextSelect?.(selectedText || null);
    setIsSelecting(!!selectedText);
  };

  return (
    <div className="relative w-full">
      <Button
        onClick={handleCopy}
        variant="outline"
        size="sm"
        className="absolute -top-12 right-0 shadow-sm hover:shadow-md transition-shadow"
      >
        <ClipboardCopy className="mr-2 h-4 w-4" />
        Copy Text
      </Button>
      
      <ScrollArea className="h-[60vh] w-full rounded-md border">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleSelect}
          className={`w-full min-h-full p-4 text-lg md:text-xl focus:border-primary focus:ring-1 focus:ring-primary selection:bg-primary/20 ${
            isSelecting ? 'selection:line-through' : ''
          }`}
          style={{
            lineHeight: '1.6',
            overflowY: 'visible',
            resize: 'none'
          }}
        />
      </ScrollArea>
    </div>
  );
};

export default EditableText;