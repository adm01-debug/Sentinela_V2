import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';

export type SupportedLanguage = 'pt-BR' | 'en-US' | 'es' | 'fr' | 'de' | 'it';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, { name: string; flag: string }> = {
  'pt-BR': { name: 'Português', flag: '🇧🇷' },
  'en-US': { name: 'English', flag: '🇺🇸' },
  'es': { name: 'Español', flag: '🇪🇸' },
  'fr': { name: 'Français', flag: '🇫🇷' },
  'de': { name: 'Deutsch', flag: '🇩🇪' },
  'it': { name: 'Italiano', flag: '🇮🇹' },
};

const resources = {
  'pt-BR': { translation: pt },
  'en-US': { translation: en },
  'es': { translation: es },
  'fr': { translation: fr },
  'de': { translation: de },
  'it': { translation: it },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('preferred-language') || 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: {
    escapeValue: false,
  },
});

export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
  localStorage.setItem('preferred-language', lang);
}

export function getCurrentLanguage(): SupportedLanguage {
  return (i18n.language || 'pt-BR') as SupportedLanguage;
}

export default i18n;
