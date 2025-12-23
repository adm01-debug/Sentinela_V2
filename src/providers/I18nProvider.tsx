import React, { createContext, useContext, useState } from 'react';
import pt from '@/locales/pt.json';
import en from '@/locales/en.json';

const translations: Record<string, Record<string, string>> = { pt, en };

interface I18nContextType { locale: string; setLocale: (l: string) => void; t: (key: string) => string; }

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState(() => localStorage.getItem('locale') || 'pt');

  const t = (key: string) => translations[locale]?.[key] || key;

  const changeLocale = (l: string) => { setLocale(l); localStorage.setItem('locale', l); };

  return <I18nContext.Provider value={{ locale, setLocale: changeLocale, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => { const ctx = useContext(I18nContext); if (!ctx) throw new Error('useI18n must be used within I18nProvider'); return ctx; };
