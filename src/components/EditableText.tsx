import * as React from "react";
import { useState, useRef } from "react";
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
  const { t } = useTranslation();
  const divRef = useRef<HTMLDivElement>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  const [persistedRange, setPersistedRange] = useState<{ start: number; end: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectionStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isEditMode) return;
    console.log('Selection started');
    
    let position;
    if ('touches' in e && e.touches.length > 0) {
      position = getCharacterPositionFromTouch({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY
      }, divRef, text);
    } else if ('clientX' in e) {
      position = getCharacterPositionFromTouch({
        clientX: e.clientX,
        clientY: e.clientY
      }, divRef, text);
    } else {
      return;
    }
    
    setSelectedRange({ start: position, end: position });
    setPersistedRange(null);
    setIsSelecting(true);
  };

  const handleSelectionMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isEditMode || !selectedRange || !isSelecting) return;
    
    let position;
    if ('touches' in e && e.touches.length > 0) {
      position = getCharacterPositionFromTouch({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY
      }, divRef, text);
    } else if ('clientX' in e) {
      position = getCharacterPositionFromTouch({
        clientX: e.clientX,
        clientY: e.clientY
      }, divRef, text);
    } else {
      return;
    }
    
    setSelectedRange(prev => prev ? { ...prev, end: position } : null);
  };

  const handleSelectionEnd = () => {
    if (!isEditMode || !selectedRange) return;
    setIsSelecting(false);
    console.log('Selection ended');
    
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
      {isEditMode && (
        <div className="mb-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
          {t('editMode.instruction')}
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4">
          <div
            ref={divRef}
            onTouchStart={handleSelectionStart}
            onTouchMove={handleSelectionMove}
            onTouchEnd={handleSelectionEnd}
            onMouseDown={handleSelectionStart}
            onMouseMove={handleSelectionMove}
            onMouseUp={handleSelectionEnd}
            onMouseLeave={() => setIsSelecting(false)}
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
        </div>
      </ScrollArea>
    </div>
  );
};

export default EditableText;