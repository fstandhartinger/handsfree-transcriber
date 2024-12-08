import { useEffect, useState } from 'react';
import { Copy, ArrowLeft, Mic } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import AuthDialog from './AuthDialog';
import RephraseModal from './RephraseModal';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAudioProcessing } from '@/hooks/useAudioProcessing';
import { useUsageCounter } from '@/hooks/useUsageCounter';

interface TextEditViewProps {
  text: string;
  onBack: () => void;
  onNewRecording: () => void;
  isAuthenticated: boolean;
}

const TextEditView = ({ text, onBack, onNewRecording, isAuthenticated }: TextEditViewProps) => {
  console.log('[TextEditView] Initializing with props:', { text, isAuthenticated });
  
  const [currentText, setCurrentText] = useState(text);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingRephrase, setIsProcessingRephrase] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showRephraseModal, setShowRephraseModal] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [history, setHistory] = useState<string[]>([text]);
  
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isRecording, startRecording, stopRecording } = useAudioRecording();
  const { incrementUsage, shouldShowUpgradeDialog } = useUsageCounter();

  const addToHistory = (newText: string) => {
    console.log('[TextEditView] Adding to history:', newText);
    setHistory(prev => [...prev, newText]);
  };

  const { processAudioForRephrase } = useAudioProcessing(currentText, addToHistory, setCurrentText);

  useEffect(() => {
    console.log('[TextEditView] Component mounted, checking usage...');
    const checkUsageAndShowDialog = async () => {
      try {
        const needsUpgrade = await incrementUsage();
        const shouldUpgrade = shouldShowUpgradeDialog();
        console.log('[TextEditView] Usage check results:', { needsUpgrade, shouldUpgrade });
        
        if (needsUpgrade || shouldUpgrade) {
          console.log('[TextEditView] Showing auth dialog');
          setShowAuthDialog(true);
        }
      } catch (error) {
        console.error('[TextEditView] Error checking usage:', error);
      }
    };
    
    checkUsageAndShowDialog();
  }, []);

  useEffect(() => {
    console.log('[TextEditView] State update:', {
      isProcessing,
      isProcessingRephrase,
      isEditMode,
      showRephraseModal,
      showAuthDialog,
      currentText,
      history
    });
  }, [isProcessing, isProcessingRephrase, isEditMode, showRephraseModal, showAuthDialog, currentText, history]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      toast({
        description: t('toasts.copied'),
      });
    } catch (err) {
      console.error('[TextEditView] Failed to copy text:', err);
      toast({
        description: t('errors.copyFailed'),
        variant: "destructive",
      });
    }
  };

  const handleStartRephrase = async () => {
    console.log('[TextEditView] Starting rephrase, authenticated:', isAuthenticated);
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setShowRephraseModal(true);
  };

  const handleRephrase = async () => {
    console.log('[TextEditView] Handling rephrase, recording:', isRecording);
    if (isRecording) {
      try {
        setIsProcessingRephrase(true);
        const audioBlob = await stopRecording();
        if (audioBlob) {
          await processAudioForRephrase(audioBlob);
        }
      } catch (error) {
        console.error('[TextEditView] Error processing rephrase:', error);
        toast({
          description: t('errors.rephrasing'),
          variant: "destructive",
        });
      } finally {
        setIsProcessingRephrase(false);
        setShowRephraseModal(false);
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentText(e.target.value);
    if (!isEditMode) setIsEditMode(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
          >
            <Copy className="h-4 w-4 mr-2" />
            {t('actions.copy')}
          </Button>
          <Button
            onClick={handleStartRephrase}
            variant="outline"
          >
            <Mic className="h-4 w-4 mr-2" />
            {t('actions.rephrase')}
          </Button>
          <Button onClick={onNewRecording}>
            {t('actions.newRecording')}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Textarea
          value={currentText}
          onChange={handleTextChange}
          className="min-h-[200px]"
        />
      </div>

      {showRephraseModal && (
        <RephraseModal
          onStop={handleRephrase}
          status={isProcessingRephrase ? 'processing' : 'recording'}
        />
      )}

      {showAuthDialog && (
        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
        />
      )}
    </div>
  );
};

export default TextEditView;