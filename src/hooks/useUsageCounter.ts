import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const FREE_ANONYMOUS_LIMIT = 3;
const FREE_AUTHENTICATED_LIMIT = 5;

export const useUsageCounter = () => {
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const getAnonymousUsageCount = () => {
    const count = parseInt(localStorage.getItem('anonymousUsageCount') || '0');
    console.log('[useUsageCounter] Retrieved anonymous usage count:', count);
    return count;
  };

  const incrementAnonymousUsage = () => {
    const currentCount = getAnonymousUsageCount();
    const newCount = currentCount + 1;
    console.log('[useUsageCounter] Incrementing anonymous usage to:', newCount);
    localStorage.setItem('anonymousUsageCount', newCount.toString());
    return newCount > FREE_ANONYMOUS_LIMIT;
  };

  const getAuthenticatedUsageCount = async () => {
    try {
      console.log('[useUsageCounter] Fetching authenticated usage count...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('[useUsageCounter] No authenticated user found');
        return 0;
      }

      const { data: usageData, error } = await supabase
        .from('usage_tracking')
        .select('authenticated_usage_count')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('[useUsageCounter] Error fetching usage:', error);
        return 0;
      }

      const count = usageData?.authenticated_usage_count || 0;
      console.log('[useUsageCounter] Retrieved authenticated usage count:', count);
      return count;
    } catch (error) {
      console.error('[useUsageCounter] Error in getAuthenticatedUsageCount:', error);
      return 0;
    }
  };

  const incrementAuthenticatedUsage = async () => {
    try {
      console.log('[useUsageCounter] Incrementing authenticated usage...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('[useUsageCounter] No authenticated user for increment');
        return false;
      }

      // Get current plan
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('plan_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('[useUsageCounter] Error fetching profile:', profileError);
        return false;
      }

      console.log('[useUsageCounter] User plan_id:', profileData?.plan_id);

      // Only increment for free plan users
      if (profileData?.plan_id === 1) {
        const currentCount = await getAuthenticatedUsageCount();
        const newCount = currentCount + 1;
        console.log('[useUsageCounter] New authenticated usage count:', newCount);

        const { error: updateError } = await supabase
          .from('usage_tracking')
          .update({ authenticated_usage_count: newCount })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('[useUsageCounter] Error updating usage:', updateError);
          return false;
        }

        setUsageCount(newCount);
        return newCount > FREE_AUTHENTICATED_LIMIT;
      }

      return false;
    } catch (error) {
      console.error('[useUsageCounter] Error in incrementAuthenticatedUsage:', error);
      return false;
    }
  };

  const incrementUsage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('[useUsageCounter] Incrementing usage for user:', user?.id);
    
    if (user) {
      return incrementAuthenticatedUsage();
    } else {
      return incrementAnonymousUsage();
    }
  };

  const shouldShowUpgradeDialog = () => {
    const { data: { user } } = supabase.auth.getSession();
    const count = usageCount;
    const shouldShow = user ? count > FREE_AUTHENTICATED_LIMIT : count > FREE_ANONYMOUS_LIMIT;
    console.log('[useUsageCounter] Should show upgrade dialog:', { count, shouldShow });
    return shouldShow;
  };

  useEffect(() => {
    const initializeUsageCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const count = await getAuthenticatedUsageCount();
        setUsageCount(count);
      } else {
        setUsageCount(getAnonymousUsageCount());
      }
      setIsLoading(false);
    };

    console.log('[useUsageCounter] Initializing usage counter...');
    initializeUsageCount();
  }, []);

  return {
    usageCount,
    isLoading,
    incrementUsage,
    shouldShowUpgradeDialog,
  };
};