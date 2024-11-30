interface Position {
  x: number;
  y: number;
}

export const getCharacterPositionFromTouch = (
  touchEvent: React.Touch,
  divRef: React.RefObject<HTMLDivElement>,
  text: string
): number => {
  if (!divRef.current) return 0;
  
  const div = divRef.current;
  const rect = div.getBoundingClientRect();
  const touchX = touchEvent.clientX - rect.left;
  const touchY = touchEvent.clientY - rect.top;

  // Erstelle temporäres Element für Textmessungen
  const temp = document.createElement('div');
  temp.style.cssText = window.getComputedStyle(div).cssText;
  temp.style.position = 'absolute';
  temp.style.visibility = 'hidden';
  temp.style.whiteSpace = 'pre-wrap';
  document.body.appendChild(temp);

  const lines = text.split('\n');
  let position = 0;
  let foundPosition = false;

  // Finde die richtige Zeile
  let currentHeight = 0;
  for (let i = 0; i < lines.length && !foundPosition; i++) {
    const line = lines[i];
    temp.textContent = line;
    const lineHeight = temp.offsetHeight;
    
    if (currentHeight <= touchY && touchY <= currentHeight + lineHeight) {
      // Exakte Zeichenposition in der Zeile finden
      let left = 0;
      let right = line.length;
      
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        temp.textContent = line.substring(0, mid);
        const width = temp.offsetWidth;
        
        if (Math.abs(width - touchX) < 5) { // 5px Toleranz
          position += mid;
          foundPosition = true;
          break;
        }
        
        if (width < touchX) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      
      if (!foundPosition) {
        position += left;
      }
      break;
    }
    
    currentHeight += lineHeight;
    position += line.length + 1; // +1 für den Zeilenumbruch
  }

  document.body.removeChild(temp);
  console.log('Touch position calculated:', { x: touchX, y: touchY, charPosition: position });
  return Math.min(position, text.length);
};