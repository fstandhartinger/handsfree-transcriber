import * as React from "react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

interface EditableTextProps {
  text: string;
  onChange: (newText: string) => void;
  onTextSelect?: (selectedText: string | null) => void;
  isEditMode: boolean;
  onEditModeChange: (isEdit: boolean) => void;
}

const EditableText = ({ text, onChange, onTextSelect, isEditMode, onEditModeChange }: EditableTextProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({
      description: t('toasts.textCopied'),
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

  return (
    <div className="relative w-full h-[calc(100vh-14rem)]">
      <div className="absolute -top-12 right-0">
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <ClipboardCopy className="mr-2 h-4 w-4" />
          {t('buttons.copyText')}
        </Button>
      </div>
      
      {isEditMode && (
        <div className="mb-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
          {t('editMode.instruction')}
        </div>
      )}

      <ScrollArea className="h-full w-full rounded-md border">
        <div className="h-full w-full p-4">
          <textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleSelect}
            className={`w-full h-full min-h-[calc(100vh-16rem)] ${isEditMode ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'} 
              focus:border-primary focus:ring-1 focus:ring-primary selection:bg-primary/20
              ${isSelecting && isEditMode ? 'selection:line-through' : ''}`}
            style={{
              lineHeight: '1.6',
              resize: 'none',
              border: 'none',
              outline: 'none',
              background: 'transparent'
            }}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default EditableText;