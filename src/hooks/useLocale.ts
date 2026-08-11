import { useState, useCallback, useEffect } from "react";

export function useLocale(defaultLocale = "en") {
  const [locale, setLocaleState] = useState(() => {
    return localStorage.getItem("locale") || navigator.language.split("-")[0] || defaultLocale;
  });

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  }, []);

  return { locale, setLocale };
}
