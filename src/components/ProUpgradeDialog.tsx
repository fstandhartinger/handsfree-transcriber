import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Crown } from "lucide-react";
import { useState } from "react";
import { loadStripe } from '@stripe/stripe-js';

interface ProUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text?: string;
}

const ProUpgradeDialog = ({ open, text }: ProUpgradeDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          description: t('errors.notAuthenticated'),
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {},
      });

      if (error) throw error;

      if (data?.sessionId) {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
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
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent 
        className="sm:max-w-md p-6" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl flex items-center gap-2">
            {t('plans.proRequired')} <Crown className="h-5 w-5 text-primary" />
          </DialogTitle>
          <DialogDescription>
            {t('plans.proRequiredDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{t('plans.proFeatures.title')}</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> {t('plans.proFeatures.unlimited')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> {t('plans.proFeatures.priority')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> {t('plans.proFeatures.support')}
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button 
            onClick={handleUpgrade}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t('buttons.processing') : t('plans.upgrade')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProUpgradeDialog; 