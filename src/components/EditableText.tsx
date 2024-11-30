import * as React from "react";
import { useState, useRef } from "react";
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
  const divRef = useRef<HTMLDivElement>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({
      description: t('toasts.textCopied'),
      duration: 2000,
      className: "fixed top-4 left-1/2 -translate-x-1/2 text-xs py-2 px-3 max-w-[33vw] w-auto",
    });
  };

  const getCharacterPositionFromTouch = (touchEvent: React.Touch): number => {
    if (!divRef.current) return 0;
    
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    const x = touchEvent.clientX - rect.left;
    const y = touchEvent.clientY - rect.top;
    
    // Create a temporary element to measure text
    const temp = document.createElement('div');
    temp.style.cssText = window.getComputedStyle(div).cssText;
    temp.style.height = 'auto';
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.whiteSpace = 'pre-wrap';
    document.body.appendChild(temp);

    const lines = text.split('\n');
    let totalHeight = 0;
    let targetLine = 0;
    
    // Find the target line based on Y position
    for (let i = 0; i < lines.length; i++) {
      temp.textContent = lines[i];
      const lineHeight = temp.offsetHeight;
      if (totalHeight + lineHeight > y) {
        targetLine = i;
        break;
      }
      totalHeight += lineHeight;
    }

    // Calculate the character position in the line based on X position
    let position = 0;
    for (let i = 0; i < targetLine; i++) {
      position += lines[i].length + 1; // +1 for newline
    }

    temp.textContent = lines[targetLine];
    const charWidth = temp.offsetWidth / lines[targetLine].length;
    position += Math.round(x / charWidth);

    document.body.removeChild(temp);
    return Math.max(0, Math.min(position, text.length));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isEditMode) return;
    
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    const position = getCharacterPositionFromTouch(touch);
    setSelectedRange({ start: position, end: position });
    setIsSelecting(true);
    
    console.log('Touch start at position:', position);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isEditMode || !touchStartPos || !selectedRange) return;
    
    const touch = e.touches[0];
    const position = getCharacterPositionFromTouch(touch);
    setSelectedRange(prev => prev ? { ...prev, end: position } : null);
    
    console.log('Touch move to position:', position);
  };

  const handleTouchEnd = () => {
    if (!isEditMode || !selectedRange) return;
    
    const start = Math.min(selectedRange.start, selectedRange.end);
    const end = Math.max(selectedRange.start, selectedRange.end);
    const selectedText = text.substring(start, end);
    
    if (selectedText) {
      onTextSelect?.(selectedText);
      console.log('Selected text:', selectedText);
    }
    
    setTouchStartPos(null);
    setSelectedRange(null);
    setIsSelecting(!!selectedText);
  };

  const getHighlightedText = () => {
    if (!selectedRange || !isEditMode) return text;

    const start = Math.min(selectedRange.start, selectedRange.end);
    const end = Math.max(selectedRange.start, selectedRange.end);

    return (
      <>
        {text.substring(0, start)}
        <span className="bg-primary/20 line-through">
          {text.substring(start, end)}
        </span>
        {text.substring(end)}
      </>
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-2rem)]">
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

      <ScrollArea className="h-full w-full">
        <div className="h-full w-full p-4">
          <div
            ref={divRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`w-full h-full min-h-[calc(100vh-4rem)] whitespace-pre-wrap ${
              isEditMode ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'
            }`}
            style={{
              lineHeight: '1.6',
              userSelect: isEditMode ? 'none' : 'text',
              cursor: isEditMode ? 'default' : 'text'
            }}
          >
            {getHighlightedText()}
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