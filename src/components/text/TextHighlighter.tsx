import React from 'react';

interface TextHighlighterProps {
  text: string;
  selectedRange: { start: number; end: number } | null;
  persistedRange: { start: number; end: number } | null;
}

const TextHighlighter: React.FC<TextHighlighterProps> = ({
  text,
  selectedRange,
  persistedRange
}) => {
  const range = selectedRange || persistedRange;
  
  if (!range) return <>{text}</>;

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

export default TextHighlighter;