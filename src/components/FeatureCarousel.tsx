import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const FeatureCarousel = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const features = [
    { key: 'fast', delay: 0 },
    { key: 'ai', delay: 1 },
    { key: 'simple', delay: 2 },
    { key: 'reliable', delay: 3 }
  ];

  useEffect(() => {
    if (hasCompleted) return;
    
    let timeout: NodeJS.Timeout;
    
    const startSequence = () => {
      setIsAnimating(true);
      setIsExiting(false);
      setActiveIndex(-1);
      
      // Animate in one by one
      features.forEach((_, index) => {
        timeout = setTimeout(() => {
          setActiveIndex(index);
        }, index * 1500);
      });

      // Wait and then trigger simultaneous exit
      timeout = setTimeout(() => {
        setIsExiting(true);
      }, features.length * 1500 + 2000);

      // Mark as completed after exit animation
      timeout = setTimeout(() => {
        setHasCompleted(true);
      }, features.length * 1500 + 3500);
    };

    startSequence();
    return () => clearTimeout(timeout);
  }, [hasCompleted]);

  if (hasCompleted) return null;

  return (
    <div className="relative h-[200px] w-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {features.map((feature, index) => {
            const isActive = index === activeIndex;
            const shouldShow = index <= activeIndex && !isExiting;
            
            if (!shouldShow && !isExiting) return null;

            const xPosition = (index - activeIndex) * 120;
            const scale = isActive ? 1 : 0.8 - Math.abs(index - activeIndex) * 0.2;
            const opacity = isActive ? 1 : 0.7 - Math.abs(index - activeIndex) * 0.2;

            return (
              <motion.div
                key={feature.key}
                initial={{ x: 500, opacity: 0, scale: 0.5 }}
                animate={!isExiting ? {
                  x: xPosition,
                  opacity,
                  scale,
                  zIndex: features.length - Math.abs(index - activeIndex)
                } : {
                  x: -500,
                  opacity: 0,
                  scale: scale * 0.8,
                  transition: { duration: 0.5 }
                }}
                exit={{ x: -500, opacity: 0, scale: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  duration: 0.5
                }}
                className="absolute bg-background hover:bg-muted/50 rounded-xl p-3 transition-colors duration-200 border border-border/50 hover:border-primary/20 w-[200px] h-[100px] flex"
              >
                <div className="flex flex-col items-center text-center space-y-2 w-full justify-center">
                  <span className="text-base font-medium">
                    {t(`features.${feature.key}.title`)}
                  </span>
                  <p className="text-xs text-muted-foreground/70">
                    {t(`features.${feature.key}.description`)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FeatureCarousel; 