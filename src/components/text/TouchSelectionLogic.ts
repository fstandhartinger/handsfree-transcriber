import React from 'react';

type TouchOrMouseEvent = React.Touch | React.MouseEvent;

export const getCharacterPositionFromTouch = (
  event: TouchOrMouseEvent,
  divRef: React.RefObject<HTMLDivElement>,
  text: string
): number => {
  if (!divRef.current) return 0;
  
  const div = divRef.current;
  const rect = div.getBoundingClientRect();
  
  // Handle both mouse and touch events correctly
  const clientX = 'touches' in event ? event.clientX : event.clientX;
  const clientY = 'touches' in event ? event.clientY : event.clientY;
  
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const range = document.createRange();
  const textNode = Array.from(div.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
  
  if (!textNode) return 0;
  
  let position = 0;
  const textContent = textNode.textContent || '';
  
  let left = 0;
  let right = textContent.length;
  
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    
    range.setStart(textNode, 0);
    range.setEnd(textNode, mid);
    const rangeRect = range.getBoundingClientRect();
    
    if (Math.abs(rangeRect.right - clientX) < 5 && 
        Math.abs(rangeRect.top + rangeRect.height/2 - clientY) < 10) {
      position = mid;
      break;
    }
    
    if (rangeRect.right < clientX) {
      left = mid + 1;
    } else {
      right = mid;
    }
    
    position = left;
  }
  
  console.log('Selection position calculated:', { x, y, position });
  return Math.min(position, text.length);
};