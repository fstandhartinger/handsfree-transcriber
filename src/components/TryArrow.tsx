import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const TryArrow = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const startCycle = () => {
      // Show arrow
      setIsVisible(true);
      
      // Hide after 2 seconds
      timeout = setTimeout(() => {
        setIsVisible(false);
        
        // If we haven't shown 5 times yet, schedule next appearance
        if (cycleCount < 4) {
          timeout = setTimeout(() => {
            setCycleCount(prev => prev + 1);
            startCycle();
          }, 3000); // Wait 3 seconds before next appearance
        }
      }, 2000);
    };

    // Initial delay of 3 seconds before first appearance
    timeout = setTimeout(startCycle, 3000);

    return () => clearTimeout(timeout);
  }, [cycleCount]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.img
          src="/try-arrow.png"
          alt=""
          className="w-8 h-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </AnimatePresence>
  );
};

export default TryArrow; 