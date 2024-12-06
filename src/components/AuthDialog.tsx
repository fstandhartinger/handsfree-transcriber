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
  
  console.log('Auth site URL:', siteUrl); // Debug log

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('auth.continueUsing')}</DialogTitle>
        </DialogHeader>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          redirectTo={siteUrl}
          view="sign_in"
          showLinks={false}
          onlyThirdPartyProviders={true}
          queryParams={{
            access_type: 'offline',
            prompt: 'consent',
            site_url: siteUrl, // Dynamically set the site URL
          }}
          socialLayout="horizontal"
          theme="default"
        />
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;