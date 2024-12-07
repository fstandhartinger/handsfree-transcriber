import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const { t } = useTranslation();
  
  // Get the current URL without any hash or query parameters
  const siteUrl = window.location.origin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl">{t('auth.continueUsing')}</DialogTitle>
        </DialogHeader>
        <div className="[&_button]:flex-1 [&_button]:h-11 [&_button]:p-2.5 [&_button]:bg-[#4285f4] [&_button]:text-white [&_button:hover]:bg-[#357ae8] [&_button_img]:w-[18px] [&_button_img]:h-[18px] [&_button_img]:mr-2.5">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4285f4',
                    brandAccent: '#357ae8'
                  }
                }
              }
            }}
            providers={['google']}
            redirectTo={siteUrl}
            view="sign_in"
            showLinks={false}
            onlyThirdPartyProviders={true}
            queryParams={{
              access_type: 'offline',
              prompt: 'consent',
              site_url: siteUrl,
            }}
            socialLayout="horizontal"
            theme="default"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;