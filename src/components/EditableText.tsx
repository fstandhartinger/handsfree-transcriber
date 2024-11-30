import * as React from "react";
import { useToast } from "@/hooks/use-toast";

interface EditableTextProps {
  text: string;
  onChange: (newText: string) => void;
}

const EditableText = ({ text, onChange }: EditableTextProps) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Text copied to clipboard",
      duration: 2000,
      className: "top-0 right-0 fixed mt-4 mr-4 text-sm py-2 px-3 max-w-[50vw] w-auto",
    });
  };

  return (
    <div className="editable-text">
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className="border p-2 w-full"
      />
      <button onClick={handleCopy} className="mt-2">
        Copy Text
      </button>
    </div>
  );
};

export default EditableText;
