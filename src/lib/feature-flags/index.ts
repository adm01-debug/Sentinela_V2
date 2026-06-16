interface FeatureFlags {
  newDashboard: boolean;
  darkMode: boolean;
  exportPDF: boolean;
  realTimeUpdates: boolean;
  advancedReports: boolean;
  mobileApp: boolean;
}
const defaultFlags: FeatureFlags = {
  newDashboard: true,
  darkMode: true,
  exportPDF: true,
  realTimeUpdates: true,
  advancedReports: false,
  mobileApp: false,
};
const flags: FeatureFlags = { ...defaultFlags };
export const initFeatureFlags = async (): Promise<void> => {
  // Feature flags are managed locally; no remote fetch needed
};
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => flags[feature] ?? false;
export const getFeatureFlags = (): FeatureFlags => ({ ...flags });
export const setFeatureFlag = (feature: keyof FeatureFlags, enabled: boolean): void => {
  flags[feature] = enabled;
};
