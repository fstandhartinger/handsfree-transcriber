import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";

const AUTO_COPY_STORAGE_KEY = "settings.autoCopyToClipboard";

export function useAutoCopyToClipboard() {
  const [autoCopy, setAutoCopy] = useState(() => {
    const stored = localStorage.getItem(AUTO_COPY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    localStorage.setItem(AUTO_COPY_STORAGE_KEY, JSON.stringify(autoCopy));
  }, [autoCopy]);

  return [autoCopy, setAutoCopy] as const;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { t } = useTranslation();
  const [autoCopy, setAutoCopy] = useAutoCopyToClipboard();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoCopy"
              checked={autoCopy}
              onCheckedChange={(checked) => setAutoCopy(checked as boolean)}
            />
            <label
              htmlFor="autoCopy"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('settings.autoCopy')}
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 