import { createContext, useContext, ReactNode } from "react";
import { logger } from "@/lib/logger";

interface AnalyticsContextType {
  track: (event: string, data?: Record<string, string | number | boolean>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  track: (event, data) => {
    logger.info("[Analytics]", event, data);
  },
});

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => (
  <AnalyticsContext.Provider value={{ track: (e, d) => logger.info("[Analytics]", e, d) }}>
    {children}
  </AnalyticsContext.Provider>
);

export const useAnalytics = () => useContext(AnalyticsContext);
