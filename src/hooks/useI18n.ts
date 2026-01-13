import { useState, useCallback, useMemo } from "react";

type Translations = Record<string, Record<string, string>>;

export function useI18n(translations: Translations, defaultLocale = "en") {
  const [locale, setLocale] = useState(defaultLocale);

  const t = useCallback((key: string, params?: Record<string, string>) => {
    let text = translations[locale]?.[key] || translations[defaultLocale]?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{{${k}}}`, "g"), v);
      });
    }
    return text;
  }, [locale, translations, defaultLocale]);

  const availableLocales = useMemo(() => Object.keys(translations), [translations]);

  return { locale, setLocale, t, availableLocales };
}
