import { useEffect, useState } from 'react';
import { Copy, ArrowLeft, Mic, Share, FileText, ChevronDown, Briefcase, Scissors, Coffee } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import AuthDialog from './AuthDialog';
import RecordingModal from './RecordingModal';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAudioProcessing } from '@/hooks/useAudioProcessing';
import { useUsageCounter } from '@/hooks/useUsageCounter';
import ProfileButton from './ProfileButton';
import ShareButton from './ShareButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TextEditViewProps {
  text: string | null;
  onBack: () => void;
  onNewRecording: () => void;
  isAuthenticated: boolean;
}

const TextEditView = ({ text, onBack, onNewRecording, isAuthenticated }: TextEditViewProps) => {
  const [currentText, setCurrentText] = useState(text);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingRephrase, setIsProcessingRephrase] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [history, setHistory] = useState<string[]>([text || '']);
  
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isRecording, startRecording, stopRecording } = useAudioRecording();
  const { incrementUsage, shouldShowUpgradeDialog } = useUsageCounter();

  const addToHistory = (newText: string) => {
    setHistory(prev => [...prev, newText]);
  };

  const { processAudioForRephrase } = useAudioProcessing(currentText || '', addToHistory, setCurrentText);

  useEffect(() => {
    const checkUsageAndShowDialog = async () => {
      try {
        if (currentText) {
          const needsUpgrade = await incrementUsage();
          const shouldUpgrade = shouldShowUpgradeDialog();
          
          if (needsUpgrade && !isAuthenticated) {
            setShowAuthDialog(true);
          }
        }
      } catch (error) {
        console.error('[TextEditView] Error checking usage:', error);
      }
    };
    
    checkUsageAndShowDialog();
  }, [currentText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentText || '');
      toast({
        description: t('toasts.copied'),
      });
    } catch (err) {
      console.error('[TextEditView] Failed to copy text:', err);
      toast({
        description: t('errors.copyFailed'),
      });
    }
  };

  const handleNewRecording = () => {
    setShowRecordingModal(true);
    startRecording();
  };

  const handleStopRecording = async () => {
    if (isRecording) {
      try {
        setIsProcessingRephrase(true);
        const audioBlob = await stopRecording();
        if (audioBlob) {
          await processAudioForRephrase(audioBlob);
        }
      } catch (error) {
        console.error('[TextEditView] Error processing recording:', error);
        toast({
          description: t('errors.recording'),
          variant: "destructive",
        });
      } finally {
        setIsProcessingRephrase(false);
        setShowRecordingModal(false);
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentText(e.target.value);
    if (!isEditMode) setIsEditMode(true);
  };

  const handleStyleClick = (style: string) => {
    // Handle style click
  };

  const handleStartRephrase = async () => {
    setIsProcessingRephrase(true);
    try {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        await processAudioForRephrase(audioBlob);
      }
    } catch (error) {
      console.error('[TextEditView] Error processing recording:', error);
      toast({
        description: t('errors.recording'),
        variant: "destructive",
      });
    } finally {
      setIsProcessingRephrase(false);
      setShowRecordingModal(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed top-0 left-0 right-0 bg-background z-10">
        <div className="flex justify-between items-center p-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-2 items-center">
            {currentText && (
              <>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="icon"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <ShareButton text={currentText || ''} />
              </>
            )}
            <ProfileButton />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-20 pb-8 max-w-3xl">
        <Textarea
          value={currentText || ''}
          onChange={handleTextChange}
          className="min-h-[200px] text-xl md:text-2xl border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none bg-transparent"
          placeholder={t('placeholder.enterText')}
        />
      </div>

      {showRecordingModal && (
        <RecordingModal
          onStop={handleStopRecording}
          mode="instruction"
          isRecording={isRecording}
          onStartRecording={startRecording}
          onCancel={() => {
            setShowRecordingModal(false);
            if (isRecording) {
              stopRecording();
            }
          }}
          isProcessing={isProcessingRephrase}
        />
      )}

      {showAuthDialog && (
        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
        />
      )}

      <div className="fixed bottom-4 right-4 flex flex-col-reverse gap-2">
        {currentText && (
          <>
            <Button
              onClick={handleNewRecording}
              className="rounded-full shadow-lg flex items-center gap-2 px-4"
            >
              <Mic className="h-5 w-5" />
              {t('buttons.newRecording')}
            </Button>
            <Button
              onClick={handleStartRephrase}
              className="rounded-full shadow-lg flex items-center gap-2 px-4"
            >
              <Mic className="h-5 w-5" />
              {t('buttons.rephrase')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="rounded-full shadow-lg flex items-center gap-2 px-4"
                >
                  <FileText className="w-5 h-5" />
                  {t('buttons.style')}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border border-border shadow-lg">
                <DropdownMenuItem onClick={() => handleStyleClick("Formal")} className="hover:bg-accent">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {t('buttons.formal')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStyleClick("Concise")} className="hover:bg-accent">
                  <Scissors className="w-4 h-4 mr-2" />
                  {t('buttons.concise')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStyleClick("Casual")} className="hover:bg-accent">
                  <Coffee className="w-4 h-4 mr-2" />
                  {t('buttons.casual')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        {!currentText && (
          <Button
            onClick={handleNewRecording}
            className="rounded-full shadow-lg flex items-center gap-2 px-4"
          >
            <Mic className="h-5 w-5" />
            {t('buttons.newRecording')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TextEditView;