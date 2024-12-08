import { useEffect, useState } from 'react';
import { Crown, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

const Plans = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgradeToPro = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }

      console.log('Calling create-checkout-session function...');
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {},
      });

      if (error) {
        console.error('Error from create-checkout-session:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Redirecting to checkout URL:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        description: t('errors.checkoutError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="icon"
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <h1 className="text-3xl font-bold text-center mb-12">{t('plans.title')}</h1>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">{t('plans.freePlan.title')}</h2>
            <p className="text-muted-foreground mb-6">{t('plans.freePlan.description')}</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {t('plans.freePlan.features.limited')}
              </li>
            </ul>
            <p className="text-2xl font-bold mb-6">{t('plans.freePlan.price')}</p>
          </div>

          {/* Pro Plan */}
          <div className="border rounded-lg p-6 bg-card relative">
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
              <Crown className="h-4 w-4 inline-block mr-1" />
              Pro
            </div>
            <h2 className="text-xl font-semibold mb-4">{t('plans.proPlan.title')}</h2>
            <p className="text-muted-foreground mb-6">{t('plans.proPlan.description')}</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {t('plans.proPlan.features.unlimited')}
              </li>
            </ul>
            <p className="text-2xl font-bold mb-6">$5/month</p>
            <Button 
              className="w-full" 
              onClick={handleUpgradeToPro}
              disabled={isLoading}
            >
              {isLoading ? t('status.loading') : t('plans.upgradeToPro')}
            </Button>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              {t('plans.termsNotice')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;