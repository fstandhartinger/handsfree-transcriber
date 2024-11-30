import * as React from "react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { getCharacterPositionFromTouch } from "./text/TouchSelectionLogic";
import TextHighlighter from "./text/TextHighlighter";

interface EditableTextProps {
  text: string;
  onChange: (newText: string) => void;
  onTextSelect?: (selectedText: string | null) => void;
  isEditMode: boolean;
  onEditModeChange: (isEdit: boolean) => void;
}

const EditableText = ({
  text,
  onChange,
  onTextSelect,
  isEditMode,
  onEditModeChange
}: EditableTextProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const divRef = useRef<HTMLDivElement>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  const [persistedRange, setPersistedRange] = useState<{ start: number; end: number } | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({
      description: t('toasts.textCopied'),
      duration: 2000,
      className: "fixed top-4 left-1/2 -translate-x-1/2 text-xs py-2 px-3 max-w-[33vw] w-auto",
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isEditMode) return;
    
    const position = getCharacterPositionFromTouch(e.touches[0], divRef, text);
    console.log('Touch start at position:', position);
    setSelectedRange({ start: position, end: position });
    setPersistedRange(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isEditMode || !selectedRange) return;
    
    const position = getCharacterPositionFromTouch(e.touches[0], divRef, text);
    console.log('Touch move to position:', position);
    setSelectedRange(prev => prev ? { ...prev, end: position } : null);
  };

  const handleTouchEnd = () => {
    if (!isEditMode || !selectedRange) return;
    
    const start = Math.min(selectedRange.start, selectedRange.end);
    const end = Math.max(selectedRange.start, selectedRange.end);
    const selectedText = text.substring(start, end);
    
    if (selectedText) {
      console.log('Selection completed:', { start, end, text: selectedText });
      setPersistedRange({ start, end });
      onTextSelect?.(selectedText);
    }
    
    setSelectedRange(null);
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-8rem)] mt-16">
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

      <ScrollArea className="flex-1">
        <div className="p-4">
          <div
            ref={divRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`whitespace-pre-wrap ${
              isEditMode ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'
            }`}
            style={{
              lineHeight: '1.6',
              userSelect: isEditMode ? 'none' : 'text',
              cursor: isEditMode ? 'default' : 'text'
            }}
          >
            <TextHighlighter
              text={text}
              selectedRange={selectedRange}
              persistedRange={persistedRange}
            />
          </div>
          <textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            readOnly={isEditMode}
            className="sr-only"
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default EditableText;