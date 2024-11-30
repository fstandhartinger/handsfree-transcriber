import { useRef, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      console.log('Starting instruction recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('Instruction recording started');
    } catch (error) {
      console.error('Error starting instruction recording:', error);
      toast({
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    try {
      console.log('Stopping instruction recording...');
      mediaRecorderRef.current.stop();
      
      // Clean up the media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('Audio track stopped:', track.label);
        });
        streamRef.current = null;
      }
      
      setIsRecording(false);
      console.log('Instruction recording stopped');
      
      return new Promise<Blob>((resolve) => {
        mediaRecorderRef.current!.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
          resolve(audioBlob);
        };
      });
    } catch (error) {
      console.error('Error stopping instruction recording:', error);
      throw error;
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};