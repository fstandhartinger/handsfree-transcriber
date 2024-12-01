interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay = ({ message = "Processing..." }: LoadingOverlayProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[12rem] p-8">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-center text-foreground font-medium">{message}</p>
    </div>
  );
};

export default LoadingOverlay;