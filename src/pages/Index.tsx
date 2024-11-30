import { useState } from "react";
import { Mic, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import RecordingView from "@/components/RecordingView";
import TextEditView from "@/components/TextEditView";

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const { toast } = useToast();

  const startRecording = () => {
    setIsRecording(true);
    // TODO: Implement actual recording logic
  };

  const stopRecording = async () => {
    setIsRecording(false);
    // TODO: Implement actual recording stop and transcription
    // For now, simulate transcription
    setTimeout(() => {
      const mockText = "This is a sample transcribed text. It will be replaced with actual Whisper transcription.";
      setTranscribedText(mockText);
      navigator.clipboard.writeText(mockText);
      toast({
        description: "Text copied to clipboard",
        duration: 2000,
      });
    }, 2000);
  };

  if (transcribedText) {
    return <TextEditView text={transcribedText} onBack={() => setTranscribedText(null)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {isRecording ? (
        <RecordingView onStop={stopRecording} />
      ) : (
        <Button
          onClick={startRecording}
          size="lg"
          className="w-16 h-16 rounded-full"
        >
          <Mic className="w-8 h-8" />
        </Button>
      )}
    </div>
  );
};

export default Index;