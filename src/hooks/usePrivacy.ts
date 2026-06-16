import { useState, useCallback, useEffect } from "react";

interface PrivacySettings {
  shareAnalytics: boolean;
  shareLocation: boolean;
  shareUsage: boolean;
  doNotTrack: boolean;
}

export function usePrivacy() {
  const [settings, setSettings] = useState<PrivacySettings>({
    shareAnalytics: false,
    shareLocation: false,
    shareUsage: false,
    doNotTrack: navigator.doNotTrack === "1",
  });

  useEffect(() => {
    const stored = localStorage.getItem("privacySettings");
    if (stored) setSettings(JSON.parse(stored));
  }, []);

  const update = useCallback((updates: Partial<PrivacySettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem("privacySettings", JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, update };
}
