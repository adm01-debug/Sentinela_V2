import { createContext, useContext, ReactNode } from "react";
const AnalyticsContext = createContext({ track: (event: string, data?: any) => { console.log("[Analytics]", event, data); } });
export const AnalyticsProvider = ({ children }: { children: ReactNode }) => <AnalyticsContext.Provider value={{ track: (e, d) => console.log("[Analytics]", e, d) }}>{children}</AnalyticsContext.Provider>;
export const useAnalytics = () => useContext(AnalyticsContext);
