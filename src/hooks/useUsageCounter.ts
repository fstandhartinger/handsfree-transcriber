import { useState, useEffect } from 'react';

const USAGE_KEY = 'app_usage_count';
const MAX_FREE_USES = 3;

export const useUsageCounter = () => {
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    const storedCount = localStorage.getItem(USAGE_KEY);
    if (!storedCount) {
      localStorage.setItem(USAGE_KEY, '0');
    } else {
      const parsedCount = parseInt(storedCount, 10);
      if (isNaN(parsedCount)) {
        localStorage.setItem(USAGE_KEY, '0');
        setUsageCount(0);
      } else {
        setUsageCount(parsedCount);
      }
    }
  }, []);

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem(USAGE_KEY, newCount.toString());
    return newCount > MAX_FREE_USES;
  };

  return {
    usageCount,
    incrementUsage,
    maxFreeUses: MAX_FREE_USES
  };
};