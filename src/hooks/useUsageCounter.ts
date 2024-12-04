import { useState, useEffect } from 'react';

const USAGE_KEY = 'app_usage_count';
const MAX_FREE_USES = 5;

export const useUsageCounter = () => {
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    const storedCount = localStorage.getItem(USAGE_KEY);
    if (storedCount) {
      setUsageCount(parseInt(storedCount, 10));
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