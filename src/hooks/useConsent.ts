import { useState, useCallback, useEffect } from "react";

interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  necessary: boolean;
}

export function useConsent() {
  const [consent, setConsent] = useState<ConsentState>({
    analytics: false,
    marketing: false,
    preferences: false,
    necessary: true,
  });
  const [hasResponded, setHasResponded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("consent");
    if (saved) {
      setConsent(JSON.parse(saved));
      setHasResponded(true);
    }
  }, []);

  const updateConsent = useCallback(
    (updates: Partial<ConsentState>) => {
      const newConsent = { ...consent, ...updates, necessary: true };
      setConsent(newConsent);
      localStorage.setItem("consent", JSON.stringify(newConsent));
      setHasResponded(true);
    },
    [consent]
  );

  const acceptAll = useCallback(() => {
    updateConsent({ analytics: true, marketing: true, preferences: true });
  }, [updateConsent]);

  const rejectAll = useCallback(() => {
    updateConsent({ analytics: false, marketing: false, preferences: false });
  }, [updateConsent]);

  return { consent, hasResponded, updateConsent, acceptAll, rejectAll };
}
