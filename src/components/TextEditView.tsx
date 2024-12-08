import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';

interface TextEditViewProps {
  text: string;
  onBack: () => void;
  onNewRecording: () => void;
  isAuthenticated: boolean;
}

const TextEditView = ({ text, onBack, onNewRecording, isAuthenticated }: TextEditViewProps) => {
  const [showRephraseModal, setShowRephraseModal] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNewRecording = async () => {
    const needsUpgrade = await incrementUsage();
    if (needsUpgrade) {
      if (!isAuthenticated) {
        localStorage.setItem('needs_auth', 'true');
        setShowAuthDialog(true);
      } else {
        // Redirect to plans page for upgrade
        navigate('/plans');
        toast({
          description: t('auth.maxUsageReached'),
          duration: 5000,
        });
      }
      return;
    }
    onNewRecording();
  };

  const handleRephrase = async () => {
    const needsUpgrade = await incrementUsage();
    if (needsUpgrade) {
      if (!isAuthenticated) {
        localStorage.setItem('needs_auth', 'true');
        setShowAuthDialog(true);
      } else {
        // Redirect to plans page for upgrade
        navigate('/plans');
        toast({
          description: t('auth.maxUsageReached'),
          duration: 5000,
        });
      }
      return;
    }
    setShowRephraseModal(true);
  };

  return (
    <div>
      <h1>Edit Text</h1>
      <p>{text}</p>
      <Button onClick={handleNewRecording}>New Recording</Button>
      <Button onClick={handleRephrase}>Rephrase</Button>
      {showAuthDialog && <AuthDialog onClose={() => setShowAuthDialog(false)} />}
      {showRephraseModal && <RephraseModal onClose={() => setShowRephraseModal(false)} />}
    </div>
  );
};

export default TextEditView;
