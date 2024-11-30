import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditableTextProps {
  text: string;
  onChange: (text: string) => void;
  onTextSelect: (text: string | null) => void;
}

const EditableText = ({ text, onChange, onTextSelect }: EditableTextProps) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Text copied to clipboard",
      duration: 2000,
      className: "top-0 right-0 fixed mt-4 mr-4 text-sm py-2 px-3",
    });
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-2 rounded-full z-10"
        onClick={handleCopy}
      >
        <Clipboard className="h-4 w-4" />
      </Button>
      <ScrollArea className="flex-1 bg-white rounded-lg shadow-sm p-4 mb-4">
        <textarea
          className="w-full h-full min-h-[200px] text-lg leading-relaxed resize-none border-none focus:outline-none"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onMouseUp={() => {
            const selection = window.getSelection();
            if (selection && selection.toString()) {
              onTextSelect(selection.toString());
            }
          }}
        />
      </ScrollArea>
    </div>
  );
};

export default EditableText;