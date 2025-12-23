export const featuresConfig = {
  screenshots: import.meta.env.VITE_FEATURE_SCREENSHOTS !== 'false',
  geofencing: import.meta.env.VITE_FEATURE_GEOFENCING !== 'false',
  aiInsights: import.meta.env.VITE_FEATURE_AI === 'true',
  realtime: import.meta.env.VITE_FEATURE_REALTIME !== 'false',
  darkMode: true,
  notifications: true,
};
