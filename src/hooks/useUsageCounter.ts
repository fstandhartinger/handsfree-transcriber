import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const USAGE_KEY = 'app_usage_count';
const MAX_FREE_USES = 3;
const MAX_AUTHENTICATED_USES = 3;

export const useUsageCounter = () => {
  const [usageCount, setUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUsage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log('Checking authenticated user usage');
          const { data: profileData, error: profileError } = await supabase
            .from('usage_tracking')
            .select('authenticated_usage_count')
            .eq('user_id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching usage data:', profileError);
            setUsageCount(0);
          } else {
            console.log('Retrieved authenticated usage count:', profileData.authenticated_usage_count);
            setUsageCount(profileData.authenticated_usage_count);
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('Incrementing authenticated user usage');
        const { data: profileData, error: fetchError } = await supabase
          .from('usage_tracking')
          .select('authenticated_usage_count')
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          console.error('Error fetching usage data:', fetchError);
          return { needsAuth: false, needsPro: false };
        }

        const newCount = (profileData.authenticated_usage_count || 0) + 1;
        console.log('New authenticated usage count:', newCount);

        const { error: updateError } = await supabase
          .from('usage_tracking')
          .update({ authenticated_usage_count: newCount })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating usage count:', updateError);
          return { needsAuth: false, needsPro: false };
        }

        const { data: userData, error: userFetchError } = await supabase
          .from('profiles')
          .select('plan_id')
          .eq('id', user.id)
          .single();

          if (userFetchError) {
            console.error('Error retrieving user plan info:', userFetchError);
            return { needsAuth: false, needsPro: false };
          }
  

        setUsageCount(newCount);
        return { 
          needsAuth: false, 
          needsPro: userData.plan_id === 1 && newCount > MAX_AUTHENTICATED_USES 
        };
      } else {
        console.log('Incrementing anonymous user usage');
        const currentCount = parseInt(localStorage.getItem(USAGE_KEY) || '0', 10);
        const newCount = currentCount + 1;
        localStorage.setItem(USAGE_KEY, newCount.toString());
        setUsageCount(newCount);
        return { needsAuth: newCount > MAX_FREE_USES, needsPro: false };
      }
    } catch (error) {
      console.error('Error in incrementUsage:', error);
      return { needsAuth: false, needsPro: false };
    }
  };

  return {
    usageCount,
    incrementUsage,
    maxFreeUses: MAX_FREE_USES,
    isLoading
  };
};