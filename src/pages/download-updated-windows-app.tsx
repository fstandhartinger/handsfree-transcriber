import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const DownloadUpdatedWindowsApp = () => {
  const { t } = useTranslation();
  const downloadUrl = "https://www.dropbox.com/scl/fi/k14pf9cor81mwnsysyxud/handsfree-transcriber.exe?rlkey=g73uxxtldzb8xerrf4ldo14e4&dl=1";

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-2xl font-bold">{t('download.newVersionAvailable')}</h1>
        <p className="text-muted-foreground">
          {t('download.updateDescription')}
        </p>
        <Button
          onClick={() => window.location.href = downloadUrl}
          size="lg"
          className="gap-2"
        >
          <Download className="w-5 h-5" />
          {t('download.button')}
        </Button>
      </div>
    </div>
  );
};

export default DownloadUpdatedWindowsApp; 