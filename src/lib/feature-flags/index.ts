interface FeatureFlags { newDashboard: boolean; darkMode: boolean; exportPDF: boolean; realTimeUpdates: boolean; advancedReports: boolean; mobileApp: boolean; }
const defaultFlags: FeatureFlags = { newDashboard: true, darkMode: true, exportPDF: true, realTimeUpdates: true, advancedReports: false, mobileApp: false };
let flags: FeatureFlags = { ...defaultFlags };
export const initFeatureFlags = async (): Promise<void> => {
  try {
    const response = await fetch('/api/feature-flags');
    if (response.ok) flags = { ...defaultFlags, ...await response.json() };
  } catch { console.warn('Failed to load feature flags, using defaults'); }
};
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => flags[feature] ?? false;
export const getFeatureFlags = (): FeatureFlags => ({ ...flags });
export const setFeatureFlag = (feature: keyof FeatureFlags, enabled: boolean): void => { flags[feature] = enabled; };
