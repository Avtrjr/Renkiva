import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { languageNames } from '@/i18n';
import { Globe } from 'lucide-react';

export const LanguageDetectionToast = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const autoDetectedLang = sessionStorage.getItem('i18n-auto-detected');
    const alreadyShown = sessionStorage.getItem('i18n-auto-detected-shown');

    if (autoDetectedLang && !alreadyShown) {
      // Mark as shown so it doesn't repeat
      sessionStorage.setItem('i18n-auto-detected-shown', 'true');
      sessionStorage.removeItem('i18n-auto-detected');

      const langName = languageNames[autoDetectedLang] || autoDetectedLang;
      
      // Small delay to ensure the app is rendered
      setTimeout(() => {
        toast(t('toast.languageDetected', { language: langName }), {
          description: t('toast.languageDetectedDescription'),
          icon: <Globe className="h-4 w-4" />,
          duration: 5000,
        });
      }, 500);
    }
  }, [t, i18n.language]);

  return null;
};
