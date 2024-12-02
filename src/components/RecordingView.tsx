import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface RecordingViewProps {
  onStop: () => void;
}

const RecordingView = ({ onStop }: RecordingViewProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={onStop}
        size="lg"
        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center p-0"
      >
        <div className="w-6 h-6 bg-white rounded-none" />
      </Button>
      <p className="text-lg">{t('recording.recording')}</p>
    </div>
  );
};

export default RecordingView;