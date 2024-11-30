import { StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordingModalProps {
  onStop: () => void;
  selectedText: string;
}

const RecordingModal = ({ onStop, selectedText }: RecordingModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center recording-pulse mb-4 mx-auto">
          <div className="w-4 h-4 bg-white rounded-full" />
        </div>
        
        <div className="mb-6 space-y-4">
          <p className="text-center font-medium">Markierter Text:</p>
          <p className="text-sm text-gray-600 line-through bg-gray-100 p-3 rounded">
            {selectedText}
          </p>
          <p className="text-center text-sm text-gray-600">
            Sprechen Sie Ihre Korrekturanweisungen...
            <br />
            (z.B. "Mache diesen Teil ausführlicher" oder "Entferne das")
          </p>
        </div>

        <Button
          onClick={onStop}
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 mx-auto block hover:bg-red-50"
        >
          <StopCircle className="w-8 h-8 text-red-500" />
        </Button>
      </div>
    </div>
  );
};

export default RecordingModal;