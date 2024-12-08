import { Mic, FileText, AlertCircle, Undo, Users, ChevronDown, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TextControlsProps {
  onStyleChange: (style: string) => void;
  onUndo: () => void;
  previousTextExists: boolean;
  isProcessing: boolean;
  onStartInstructionRecording: () => void;
  onStopInstructionRecording: () => void;
  isRecordingInstruction: boolean;
  selectedText: string | null;
  onStartRephraseRecording: () => void;
  onStopRephraseRecording: () => void;
  isRecordingRephrase: boolean;
  isEditMode: boolean;
  onEditModeChange: (isEdit: boolean) => void;
  onCancel?: () => void;
  onNewRecording: () => void;
}

const TextControls = ({
  onStyleChange,
  onUndo,
  previousTextExists,
  isProcessing,
  onStartInstructionRecording,
  onStopInstructionRecording,
  isRecordingInstruction,
  selectedText,
  onStartRephraseRecording,
  onStopRephraseRecording,
  isRecordingRephrase,
  isEditMode,
  onEditModeChange,
  onCancel,
  onNewRecording,
}: TextControlsProps) => {
  const { t } = useTranslation();

  const handleStyleClick = (style: string) => {
    console.log('Style button clicked:', { style, isProcessing });
    onStyleChange(style);
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col-reverse gap-2">
      {!isEditMode ? (
        <>
          <Button
            onClick={onNewRecording}
            className="rounded-full shadow-lg flex items-center gap-2 px-4"
            disabled={isProcessing}
          >
            <Circle className="w-5 h-5 fill-red-500 text-red-500" />
            {t('buttons.newRecording')}
          </Button>
          <Button 
            className="rounded-full shadow-lg flex items-center gap-2 px-4"
            disabled={isProcessing}
            onClick={() => {
              const dropdownTrigger = document.querySelector('[data-trigger-style]');
              if (dropdownTrigger) {
                (dropdownTrigger as HTMLButtonElement).click();
              }
            }}
          >
            <FileText className="w-5 h-5" />
            {t('buttons.style')}
            <ChevronDown className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="hidden"
                data-trigger-style
                disabled={isProcessing}
              >
                <span className="sr-only">Style menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border border-border shadow-lg" side="top">
              <DropdownMenuItem onClick={() => handleStyleClick("Formal")} className="hover:bg-accent">
                <FileText className="w-4 h-4 mr-2" />
                {t('buttons.formal')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStyleClick("Concise")} className="hover:bg-accent">
                <AlertCircle className="w-4 h-4 mr-2" />
                {t('buttons.concise')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStyleClick("Casual")} className="hover:bg-accent">
                <Users className="w-4 h-4 mr-2" />
                {t('buttons.casual')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={isRecordingRephrase ? onStopRephraseRecording : onStartRephraseRecording}
            className="rounded-full shadow-lg flex items-center gap-2 px-4"
            disabled={isProcessing}
          >
            <Mic className="w-5 h-5" />
            {t('buttons.rephrase')}
          </Button>
          {previousTextExists && (
            <Button 
              onClick={onUndo} 
              variant="outline" 
              className="rounded-full shadow-lg flex items-center gap-2 px-4"
              disabled={isProcessing}
            >
              <Undo className="w-5 h-5" />
              {t('buttons.undo')}
            </Button>
          )}
        </>
      ) : null}
    </div>
  );
};

export default TextControls;