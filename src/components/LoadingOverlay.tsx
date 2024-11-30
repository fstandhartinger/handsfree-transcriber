interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay = ({ message = "Processing..." }: LoadingOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-center">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;