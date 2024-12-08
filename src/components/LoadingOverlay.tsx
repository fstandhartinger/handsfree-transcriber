import { useTranslation } from 'react-i18next';

const LoadingSpinner = () => (
  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
);

const LoadingOverlay = () => {
  const { t } = useTranslation();
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center gap-3 justify-center">
          <LoadingSpinner />
          <span className="text-gray-700">{t('status.transcribing')}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;