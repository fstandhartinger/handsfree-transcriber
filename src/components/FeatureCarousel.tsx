import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

const FeatureCarousel = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const features = [
    { key: 'fast' },
    { key: 'ai' },
    { key: 'simple' },
    { key: 'reliable' }
  ];

  useEffect(() => {
    if (hoveredIndex !== null) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [hoveredIndex]);

  const displayIndex = hoveredIndex ?? activeIndex;

  const handleCardSelect = (index: number) => {
    setHoveredIndex(index);
    setTimeout(() => setHoveredIndex(null), 5000);
  };

  // Calculate sizes based on container width
  const containerWidth = "min(600px, 100vw - 2rem)";
  const cardWidth = "calc((min(600px, 100vw - 2rem) - 3 * min(1rem, 4vw)) / 4)";
  const cardHeight = "calc((min(600px, 100vw - 2rem) - 3 * min(1rem, 4vw)) / 4 * 0.6)";
  const gap = "min(1rem, 4vw)";

  const titleSize = "clamp(0.6rem, 1.8vw, 0.7rem)";
  const descSize = "clamp(0.55rem, 1.6vw, 0.65rem)";

  // Featured card sizes
  const featuredWidth = "min(280px, 60vw)";
  const featuredHeight = "min(140px, 30vw)";
  const featuredTitleSize = "clamp(1rem, 2.5vw, 1.25rem)";
  const featuredDescSize = "clamp(0.75rem, 2vw, 0.875rem)";

  return (
    <div className="relative h-[300px] w-full flex flex-col items-center justify-between py-8">
      {/* Large featured card */}
      <div ref={containerRef} className="flex justify-center w-full">
        <div 
          style={{ width: featuredWidth, height: featuredHeight }}
          className="bg-background rounded-lg p-4 flex"
        >
          <div className="flex flex-col items-center text-center space-y-2 w-full justify-center">
            <span className="font-medium leading-tight" style={{ fontSize: featuredTitleSize }}>
              {t(`features.${features[displayIndex].key}.title`)}
            </span>
            <p className="text-muted-foreground leading-tight" style={{ fontSize: featuredDescSize }}>
              {t(`features.${features[displayIndex].key}.description`)}
            </p>
          </div>
        </div>
      </div>

      {/* Small cards below */}
      <div className="flex justify-center w-full px-4">
        <div className="flex relative justify-center" style={{ gap, width: containerWidth }}>
          {features.map((feature, index) => {
            const isActive = index === displayIndex;
            
            return (
              <div
                ref={el => cardRefs.current[index] = el}
                key={feature.key}
                onClick={() => handleCardSelect(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ 
                  width: cardWidth, 
                  height: cardHeight,
                  opacity: isActive ? 0.5 : 1
                }}
                className={`bg-background rounded-lg p-2 flex-shrink-0 cursor-pointer min-w-0 ${
                  isActive ? 'grayscale' : ''
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-1 w-full justify-center">
                  <span className="font-medium leading-tight truncate" style={{ fontSize: titleSize }}>
                    {t(`features.${feature.key}.title`)}
                  </span>
                  <p className="text-muted-foreground leading-tight line-clamp-2" style={{ fontSize: descSize }}>
                    {t(`features.${feature.key}.description`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeatureCarousel; 