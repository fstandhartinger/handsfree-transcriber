import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Success = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Check for pending transcribed text
    const pendingText = localStorage.getItem('pending_transcribed_text');
    if (pendingText) {
      setTimeout(() => {
        localStorage.removeItem('pending_transcribed_text');
        navigate('/edit', { state: { text: pendingText } });
      }, 2000);
    } else {
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4 p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold">
          {t('success.title')}
        </h1>
        
        <p className="text-muted-foreground">
          {t('success.description')}
        </p>

        <div className="pt-4">
          <Button
            onClick={() => navigate('/')}
            className="min-w-[200px]"
          >
            {t('success.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Success; 