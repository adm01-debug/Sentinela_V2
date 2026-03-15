import { createContext, useContext, ReactNode } from "react";

interface AnalyticsContextType {
  track: (event: string, data?: Record<string, string | number | boolean>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  track: (event, data) => { console.log("[Analytics]", event, data); },
});

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => (
  <AnalyticsContext.Provider value={{ track: (e, d) => console.log("[Analytics]", e, d) }}>
    {children}
  </AnalyticsContext.Provider>
);

export const useAnalytics = () => useContext(AnalyticsContext);
