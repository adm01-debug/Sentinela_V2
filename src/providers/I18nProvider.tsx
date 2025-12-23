import React, { createContext, useContext, useState, useCallback } from 'react';
import ptBR from '@/locales/pt-BR.json';
import enUS from '@/locales/en-US.json';

type Locale = 'pt-BR' | 'en-US';
const translations: Record<Locale, any> = { 'pt-BR': ptBR, 'en-US': enUS };

interface I18nContextType { locale: Locale; setLocale: (locale: Locale) => void; t: (key: string, params?: Record<string, any>) => string; }

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('locale') as Locale) || 'pt-BR');

  const t = useCallback((key: string, params?: Record<string, any>) => {
    let text = key.split('.').reduce((obj, k) => obj?.[k], translations[locale]) as string || key;
    if (params) Object.entries(params).forEach(([k, v]) => { text = text.replace(new RegExp('{{' + k + '}}', 'g'), String(v)); });
    return text;
  }, [locale]);

  const handleSetLocale = useCallback((l: Locale) => { setLocale(l); localStorage.setItem('locale', l); }, []);

  return <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => { const ctx = useContext(I18nContext); if (!ctx) throw new Error('useI18n must be within I18nProvider'); return ctx; };
