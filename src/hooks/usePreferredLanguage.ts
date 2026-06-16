import { useState, useEffect } from "react";
export function usePreferredLanguage() {
  const [language, setLanguage] = useState(
    () => navigator.language || navigator.languages?.[0] || "en"
  );
  const [languages, setLanguages] = useState(() => [
    ...(navigator.languages || [navigator.language]),
  ]);
  useEffect(() => {
    const handler = () => {
      setLanguage(navigator.language);
      setLanguages([...navigator.languages]);
    };
    window.addEventListener("languagechange", handler);
    return () => window.removeEventListener("languagechange", handler);
  }, []);
  return {
    language,
    languages,
    isRTL: ["ar", "he", "fa", "ur"].some((l) => language.startsWith(l)),
  };
}
export default usePreferredLanguage;
