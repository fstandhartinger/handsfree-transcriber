import { Button } from "@/components/ui/button";

interface RecordingViewProps {
  onStop: () => void;
}

const RecordingView = ({ onStop }: RecordingViewProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
      <Button
        onClick={onStop}
        size="lg"
        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center p-0"
      >
        <div className="w-6 h-6 bg-white rounded-none" />
      </Button>
      <p className="text-lg">Recording...</p>
    </div>
  );
};

export default RecordingView;