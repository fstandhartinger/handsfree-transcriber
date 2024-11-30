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
  const [persistedRange, setPersistedRange] = useState<{ start: number; end: number } | null>(null);

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
    
    // Create a temporary element for text measurement
    const temp = document.createElement('div');
    temp.style.cssText = window.getComputedStyle(div).cssText;
    temp.style.height = 'auto';
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.whiteSpace = 'pre-wrap';
    document.body.appendChild(temp);

    // Split text into lines and find the target line
    const lines = text.split('\n');
    let totalHeight = 0;
    let targetLine = 0;
    let lineHeight = 0;

    // Calculate line heights and find target line
    for (let i = 0; i < lines.length; i++) {
      temp.textContent = lines[i];
      lineHeight = temp.offsetHeight;
      if (totalHeight + lineHeight > y) {
        targetLine = i;
        break;
      }
      totalHeight += lineHeight;
    }

    // Calculate character position within the line
    let position = 0;
    for (let i = 0; i < targetLine; i++) {
      position += lines[i].length + 1; // +1 for newline
    }

    // Find exact character position in the line
    const currentLine = lines[targetLine];
    temp.textContent = '';
    let closestPos = 0;
    let minDiff = Number.MAX_VALUE;

    // Binary search for the closest character position
    let left = 0;
    let right = currentLine.length;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      temp.textContent = currentLine.substring(0, mid);
      const charX = temp.offsetWidth;
      const diff = Math.abs(charX - x);

      if (diff < minDiff) {
        minDiff = diff;
        closestPos = mid;
      }

      if (charX < x) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    document.body.removeChild(temp);
    console.log('Selected position in line:', closestPos);
    return position + closestPos;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isEditMode) return;
    
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    const position = getCharacterPositionFromTouch(touch);
    setSelectedRange({ start: position, end: position });
    setIsSelecting(true);
    setPersistedRange(null);
    
    console.log('Touch start position:', position);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isEditMode || !touchStartPos || !selectedRange) return;
    
    const touch = e.touches[0];
    const position = getCharacterPositionFromTouch(touch);
    setSelectedRange(prev => prev ? { ...prev, end: position } : null);
    
    console.log('Touch move position:', position);
  };

  const handleTouchEnd = () => {
    if (!isEditMode || !selectedRange) return;
    
    const start = Math.min(selectedRange.start, selectedRange.end);
    const end = Math.max(selectedRange.start, selectedRange.end);
    const selectedText = text.substring(start, end);
    
    if (selectedText) {
      setPersistedRange({ start, end });
      onTextSelect?.(selectedText);
      console.log('Selected text:', selectedText);
    }
    
    setTouchStartPos(null);
    setSelectedRange(null);
    setIsSelecting(!!selectedText);
  };

  const getHighlightedText = () => {
    if (!isEditMode) return text;

    const range = selectedRange || persistedRange;
    if (!range) return text;

    const start = Math.min(range.start, range.end);
    const end = Math.max(range.start, range.end);

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