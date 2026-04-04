import { createContext, useContext, ReactNode } from "react";
type Flags = Record<string, boolean>;
const FeatureFlagsContext = createContext<{ flags: Flags; isEnabled: (f) => boolean }>({ flags: {}, isEnabled: () => false });
export const FeatureFlagsProvider = ({ flags, children }: { flags: Flags; children: ReactNode }) => <FeatureFlagsContext.Provider value={{ flags, isEnabled: (f) => flags[f] ?? false }}>{children}</FeatureFlagsContext.Provider>;
export const useFeatureFlags = () => useContext(FeatureFlagsContext);
