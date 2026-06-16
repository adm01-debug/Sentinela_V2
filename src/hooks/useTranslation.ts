import { useState, useCallback } from "react";

type Translations = Record<string, Record<string, string>>;

export function useTranslation(translations: Translations, defaultLang = "en") {
  const [lang, setLang] = useState(defaultLang);

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      let text = translations[lang]?.[key] || translations[defaultLang]?.[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{{${k}}}`, v);
        });
      }
      return text;
    },
    [lang, translations, defaultLang]
  );

  return { lang, setLang, t };
}
