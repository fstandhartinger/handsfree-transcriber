import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";

interface EditableTextProps {
  text: string;
  onChange: (newText: string) => void;
  onTextSelect?: (selectedText: string | null) => void;
}

const EditableText = ({ text, onChange, onTextSelect }: EditableTextProps) => {
  const { toast } = useToast();

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
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelect}
        className="w-full min-h-[200px] p-4 border rounded-md shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
};

export default EditableText;