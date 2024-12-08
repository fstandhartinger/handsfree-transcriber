import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text?: string;
}

const UpgradeDialog = ({ open, onOpenChange, text }: UpgradeDialogProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleUpgrade = () => {
    if (text) {
      localStorage.setItem('pending_transcribed_text', text);
    }
    navigate('/plans');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('upgrade.title')}</DialogTitle>
          <DialogDescription>
            {t('upgrade.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('buttons.later')}
          </Button>
          <Button onClick={handleUpgrade}>
            {t('upgrade.button')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeDialog;