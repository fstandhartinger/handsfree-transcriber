import { StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordingModalProps {
  onStop: () => void;
}

const RecordingModal = ({ onStop }: RecordingModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center recording-pulse mb-4 mx-auto">
          <div className="w-4 h-4 bg-white rounded-full" />
        </div>
        <p className="text-center mb-4">Speak your correction instructions...</p>
        <Button
          onClick={onStop}
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 mx-auto block"
        >
          <div className="w-8 h-8 bg-black" />
        </Button>
      </div>
    </div>
  );
};

export default RecordingModal;