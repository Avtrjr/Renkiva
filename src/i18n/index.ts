import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  pt: { translation: pt },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
};

// Get initial language from localStorage, browser preferences, or default to 'en'
const getInitialLanguage = (): { language: string; wasAutoDetected: boolean } => {
  if (typeof window !== 'undefined') {
    // First check localStorage for user preference
    const stored = localStorage.getItem('i18n-language');
    if (stored && resources[stored as keyof typeof resources]) {
      return { language: stored, wasAutoDetected: false };
    }
    
    // Then try to detect from browser preferences
    const browserLanguages = navigator.languages || [navigator.language];
    for (const lang of browserLanguages) {
      // Check exact match first (e.g., 'en-US' -> 'en')
      const shortLang = lang.split('-')[0].toLowerCase();
      if (resources[shortLang as keyof typeof resources]) {
        // Mark as auto-detected for first-time notification
        if (!sessionStorage.getItem('i18n-auto-detected-shown')) {
          sessionStorage.setItem('i18n-auto-detected', shortLang);
        }
        return { language: shortLang, wasAutoDetected: true };
      }
    }
  }
  return { language: 'en', wasAutoDetected: false };
};

const initialLanguageResult = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguageResult.language,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

export const languageNames: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
};

export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18n-language', lng);
  }
};
