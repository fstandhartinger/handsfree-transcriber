import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import deTranslations from './locales/de.json';

const getBrowserLanguage = () => {
  console.log('Browser language:', navigator.language);
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  console.log('Detected language:', browserLang === 'de' ? 'de' : 'en');
  return browserLang === 'de' ? 'de' : 'en';
};

const resources = {
  en: {
    translation: enTranslations
  },
  de: {
    translation: deTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getBrowserLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

console.log('i18n initialized with language:', i18n.language);

export default i18n;