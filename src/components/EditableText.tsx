import * as React from "react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, Edit2, Mic } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditableTextProps {
  text: string;
  onChange: (newText: string) => void;
  onTextSelect?: (selectedText: string | null) => void;
}

const EditableText = ({ text, onChange, onTextSelect }: EditableTextProps) => {
  const { toast } = useToast();
  const [isSelecting, setIsSelecting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Text copied to clipboard",
      duration: 2000,
      className: "fixed top-4 left-1/2 -translate-x-1/2 text-xs py-2 px-3 max-w-[33vw] w-auto",
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

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      toast({
        description: "Editiermodus aktiviert - markieren Sie Text zum Korrigieren",
        duration: 3000,
        className: "fixed top-4 left-1/2 -translate-x-1/2 text-xs py-2 px-3 max-w-[33vw] w-auto",
      });
    }
  };

  return (
    <div className="relative w-full">
      <div className="absolute -top-12 right-0 flex gap-2">
        <Button
          onClick={toggleEditMode}
          variant={isEditMode ? "secondary" : "outline"}
          size="sm"
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <Edit2 className="mr-2 h-4 w-4" />
          {isEditMode ? 'Bearbeiten beenden' : 'Text bearbeiten'}
        </Button>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <ClipboardCopy className="mr-2 h-4 w-4" />
          Copy Text
        </Button>
      </div>
      
      <ScrollArea className={`h-[60vh] w-full rounded-md border ${isEditMode ? 'selection-mode' : ''}`}>
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleSelect}
          className={`w-full min-h-full p-4 ${isEditMode ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'} 
            focus:border-primary focus:ring-1 focus:ring-primary selection:bg-primary/20
            ${isSelecting && isEditMode ? 'selection:line-through' : ''}`}
          style={{
            lineHeight: '1.6',
            overflowY: 'visible',
            resize: 'none'
          }}
        />
      </ScrollArea>

      {isSelecting && isEditMode && (
        <Button
          className="fixed bottom-20 left-1/2 -translate-x-1/2 shadow-lg"
          onClick={() => {
            console.log("Edit selection requested");
          }}
        >
          <Mic className="mr-2 h-4 w-4" />
          Korrektur aufnehmen
        </Button>
      )}
    </div>
  );
};

export default EditableText;