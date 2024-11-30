import { Button } from "@/components/ui/button";

interface RecordingViewProps {
  onStop: () => void;
}

const RecordingView = ({ onStop }: RecordingViewProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-4 h-4 bg-red-500 rounded-full recording-pulse" />
      <Button
        onClick={onStop}
        size="lg"
        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
      >
        <div className="w-8 h-8 bg-white" /> {/* Custom filled square stop icon */}
      </Button>
      <p className="text-lg">Recording...</p>
    </div>
  );
};

export default RecordingView;