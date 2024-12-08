import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const USAGE_KEY = 'app_usage_count';
const MAX_FREE_USES = 3;

export const useUsageCounter = () => {
  const [usageCount, setUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [planId, setPlanId] = useState<number>(1); // Default to free plan

  useEffect(() => {
    const checkUsage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log('Checking authenticated user usage');
          // Get user's plan and usage data
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan_id')
            .eq('id', user.id)
            .single();

          if (profile) {
            setPlanId(profile.plan_id);
          }

          const { data: usageData, error } = await supabase
            .from('usage_tracking')
            .select('authenticated_usage_count')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching usage data:', error);
            setUsageCount(0);
          } else {
            console.log('Retrieved authenticated usage count:', usageData.authenticated_usage_count);
            setUsageCount(usageData.authenticated_usage_count);
          }
        } else {
          console.log('Checking anonymous user usage');
          const storedCount = localStorage.getItem(USAGE_KEY);
          if (!storedCount) {
            localStorage.setItem(USAGE_KEY, '0');
            setUsageCount(0);
          } else {
            const parsedCount = parseInt(storedCount, 10);
            if (isNaN(parsedCount)) {
              localStorage.setItem(USAGE_KEY, '0');
              setUsageCount(0);
            } else {
              console.log('Retrieved anonymous usage count:', parsedCount);
              setUsageCount(parsedCount);
            }
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error in checkUsage:', error);
        setIsLoading(false);
      }
    };

    checkUsage();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUsage();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const incrementUsage = async () => {
    try {
      console.log('incrementUsage called');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('Incrementing authenticated user usage');
        // Get user's plan
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan_id')
          .eq('id', user.id)
          .single();

        // If user is on free plan and has reached limit, return true to trigger upgrade prompt
        if (profile?.plan_id === 1 && usageCount >= MAX_FREE_USES) {
          console.log('Free plan user reached usage limit');
          return true;
        }

        const { data: usageData, error: fetchError } = await supabase
          .from('usage_tracking')
          .select('authenticated_usage_count')
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          console.error('Error fetching usage data:', fetchError);
          return false;
        }

        const newCount = (usageData.authenticated_usage_count || 0) + 1;
        console.log('New authenticated usage count:', newCount);

        const { error: updateError } = await supabase
          .from('usage_tracking')
          .update({ authenticated_usage_count: newCount })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating usage count:', updateError);
          return false;
        }

        setUsageCount(newCount);
        return profile?.plan_id === 1 && newCount > MAX_FREE_USES;
      } else {
        console.log('Incrementing anonymous user usage');
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem(USAGE_KEY, newCount.toString());
        console.log('New anonymous usage count:', newCount);
        return newCount > MAX_FREE_USES;
      }
    } catch (error) {
      console.error('Error in incrementUsage:', error);
      return false;
    }
  };

  return {
    usageCount,
    incrementUsage,
    maxFreeUses: MAX_FREE_USES,
    isLoading,
    planId
  };
};