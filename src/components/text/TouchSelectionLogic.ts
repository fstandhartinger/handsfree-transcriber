interface TouchCoordinates {
  clientX: number;
  clientY: number;
}

export const getCharacterPositionFromTouch = (
  event: TouchCoordinates,
  divRef: React.RefObject<HTMLDivElement>,
  text: string
): number => {
  if (!divRef.current) return 0;
  
  const div = divRef.current;
  const rect = div.getBoundingClientRect();
  
  const clientX = event.clientX;
  const clientY = event.clientY;
  
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  
  const range = document.createRange();
  const textNode = Array.from(div.childNodes).find(
    node => node.nodeType === Node.TEXT_NODE
  );
  
  if (!textNode) return 0;
  
  let position = 0;
  let minDistance = Number.MAX_VALUE;
  
  for (let i = 0; i <= text.length; i++) {
    range.setStart(textNode, i);
    range.setEnd(textNode, i);
    
    const rangeRect = range.getBoundingClientRect();
    const distance = Math.sqrt(
      Math.pow(rangeRect.left - clientX, 2) + Math.pow(rangeRect.top - clientY, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      position = i;
    }
  }
  
  return position;
};