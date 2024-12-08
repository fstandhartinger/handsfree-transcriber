import { useTranslation } from 'react-i18next';

const LoadingOverlay = () => {
  const { t } = useTranslation();
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg flex items-center gap-2">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>{t('status.transcribing')}</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;