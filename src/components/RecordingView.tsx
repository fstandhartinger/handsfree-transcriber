import { StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordingViewProps {
  onStop: () => void;
}

const RecordingView = ({ onStop }: RecordingViewProps) => {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center recording-pulse">
        <div className="w-4 h-4 bg-white rounded-full" />
      </div>
      <Button
        onClick={onStop}
        variant="outline"
        size="lg"
        className="rounded-full w-16 h-16"
      >
        <StopCircle className="w-8 h-8" />
      </Button>
    </div>
  );
};

export default RecordingView;