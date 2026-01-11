import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Locale, defaultLocale, supportedLocales } from './config';
type Translations = Record<string, string | Record<string, string>>;
interface I18nContextType { locale: Locale; setLocale: (locale: Locale) => void; t: (key: string, params?: Record<string, string>) => string; }
const I18nContext = createContext<I18nContextType | null>(null);
const translations: Record<Locale, Translations> = { en: {}, pt: {}, es: {} };
export const loadTranslations = async (locale: Locale): Promise<void> => {
  if (Object.keys(translations[locale]).length === 0) {
    const module = await import('./locales/' + locale + '.json');
    translations[locale] = module.default;
  }
};
export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const setLocale = useCallback(async (newLocale: Locale) => {
    if (supportedLocales.includes(newLocale)) { await loadTranslations(newLocale); setLocaleState(newLocale); }
  }, []);
  const t = useCallback((key: string, params?: Record<string, string>) => {
    let text = key.split('.').reduce<unknown>((obj, k) => (obj as Record<string, unknown>)?.[k], translations[locale]) as string || key;
    if (params) Object.entries(params).forEach(([k, v]) => { text = text.replace('{' + k + '}', v); });
    return text;
  }, [locale]);
  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
};
export const useI18n = () => { const ctx = useContext(I18nContext); if (!ctx) throw new Error('useI18n must be used within I18nProvider'); return ctx; };
