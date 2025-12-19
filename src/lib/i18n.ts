// ============================================================
// INTERNATIONALIZATION (i18n) CONFIGURATION
// Using react-i18next for multi-language support
// ============================================================

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ============================================================
// TRANSLATIONS
// ============================================================

import ptBR from '@/locales/pt-BR.json';
import enUS from '@/locales/en-US.json';
import esES from '@/locales/es-ES.json';

// ============================================================
// SUPPORTED LANGUAGES
// ============================================================

export const SUPPORTED_LANGUAGES = {
  'pt-BR': { name: 'Português (Brasil)', flag: '🇧🇷' },
  'en-US': { name: 'English (US)', flag: '🇺🇸' },
  'es-ES': { name: 'Español', flag: '🇪🇸' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// ============================================================
// INITIALIZATION
// ============================================================

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Resources
    resources: {
      'pt-BR': { translation: ptBR },
      'en-US': { translation: enUS },
      'es-ES': { translation: esES },
    },

    // Default language
    fallbackLng: 'pt-BR',

    // Supported languages
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),

    // Detection options
    detection: {
      // Order of detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache in localStorage
      caches: ['localStorage'],
      // Key in localStorage
      lookupLocalStorage: 'sentinela-language',
    },

    // Interpolation
    interpolation: {
      escapeValue: false, // React already escapes
    },

    // React options
    react: {
      useSuspense: true,
    },

    // Debug in development
    debug: process.env.NODE_ENV === 'development',
  });

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getCurrentLanguage(): SupportedLanguage {
  return i18n.language as SupportedLanguage;
}

export function changeLanguage(lang: SupportedLanguage): Promise<void> {
  return i18n.changeLanguage(lang);
}

export function getLanguageInfo(lang: SupportedLanguage) {
  return SUPPORTED_LANGUAGES[lang];
}

// ============================================================
// EXPORTS
// ============================================================

export default i18n;
