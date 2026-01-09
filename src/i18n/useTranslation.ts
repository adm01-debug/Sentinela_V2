import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { changeLanguage, getCurrentLanguage, supportedLanguages } from './index';

export function useTranslation(namespace?: string) {
  const { t, i18n } = useI18nTranslation(namespace);

  const setLanguage = useCallback((lang: string) => {
    changeLanguage(lang);
  }, []);

  return {
    t,
    i18n,
    language: getCurrentLanguage(),
    setLanguage,
    supportedLanguages,
    isRTL: i18n.dir() === 'rtl',
  };
}

export default useTranslation;
