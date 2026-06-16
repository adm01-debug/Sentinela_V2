import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { initFeatureFlags, isFeatureEnabled } from "./index";

interface FeatureFlagsContextType {
  isEnabled: (feature) => boolean;
  isLoading: boolean;
}
const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);

type FeatureFlagKey = Parameters<typeof isFeatureEnabled>[0];

export const FeatureFlagsProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    initFeatureFlags().finally(() => setIsLoading(false));
  }, []);
  const isEnabled = (feature) => isFeatureEnabled(feature as FeatureFlagKey);
  return (
    <FeatureFlagsContext.Provider value={{ isEnabled, isLoading }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};
export const useFeatureFlags = () => {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error("useFeatureFlags must be used within FeatureFlagsProvider");
  return ctx;
};
export const useFeature = (feature) => {
  const { isEnabled, isLoading } = useFeatureFlags();
  return { enabled: isEnabled(feature), isLoading };
};
