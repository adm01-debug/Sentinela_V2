export const FEATURES = {
  SCREENSHOTS: 'screenshots',
  ACTIVITY_TRACKING: 'activity_tracking',
  GEOFENCING: 'geofencing',
  REPORTS: 'reports',
  INTEGRATIONS: 'integrations',
  AI_INSIGHTS: 'ai_insights',
  REAL_TIME: 'real_time',
  CUSTOM_ALERTS: 'custom_alerts',
};

export const FEATURE_FLAGS = {
  [FEATURES.AI_INSIGHTS]: import.meta.env.VITE_ENABLE_AI === 'true',
  [FEATURES.REAL_TIME]: true,
};
