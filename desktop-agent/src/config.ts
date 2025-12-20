// ============================================================
// SENTINELA DESKTOP AGENT - CONFIGURATION
// ============================================================

export interface AgentConfig {
  // API Configuration
  apiUrl: string;
  apiKey: string;
  deviceId: string;

  // Monitoring Settings
  screenshotInterval: number;
  trackKeystrokes: boolean;
  trackApplications: boolean;
  trackWebsites: boolean;
  blurScreenshots: boolean;

  // Geofencing
  geofencingEnabled: boolean;

  // Intervals (in milliseconds)
  heartbeatInterval: number;
  offlineQueueInterval: number;

  // Auto-start
  autoStart: boolean;

  // Security
  encryptionEnabled: boolean;

  // Auto-update
  autoUpdateEnabled: boolean;
  updateServerUrl: string;
  updateCheckInterval: number;
}

// Load from environment or use defaults
export const config: AgentConfig = {
  // API Configuration
  apiUrl: process.env.SENTINELA_API_URL || 'https://your-project.supabase.co/functions/v1',
  apiKey: process.env.SENTINELA_API_KEY || '',
  deviceId: process.env.SENTINELA_DEVICE_ID || '',

  // Monitoring Settings
  screenshotInterval: parseInt(process.env.SENTINELA_SCREENSHOT_INTERVAL || '300000', 10), // 5 minutes
  trackKeystrokes: process.env.SENTINELA_TRACK_KEYSTROKES === 'true',
  trackApplications: process.env.SENTINELA_TRACK_APPS !== 'false', // Default true
  trackWebsites: process.env.SENTINELA_TRACK_WEBSITES !== 'false', // Default true
  blurScreenshots: process.env.SENTINELA_BLUR_SCREENSHOTS === 'true',

  // Geofencing
  geofencingEnabled: process.env.SENTINELA_GEOFENCING === 'true',

  // Intervals
  heartbeatInterval: parseInt(process.env.SENTINELA_HEARTBEAT_INTERVAL || '60000', 10), // 1 minute
  offlineQueueInterval: parseInt(process.env.SENTINELA_OFFLINE_QUEUE_INTERVAL || '300000', 10), // 5 minutes

  // Auto-start
  autoStart: process.env.SENTINELA_AUTO_START !== 'false', // Default true

  // Security
  encryptionEnabled: process.env.SENTINELA_ENCRYPTION !== 'false', // Default true

  // Auto-update
  autoUpdateEnabled: process.env.SENTINELA_AUTO_UPDATE !== 'false', // Default true
  updateServerUrl: process.env.SENTINELA_UPDATE_SERVER_URL || '',
  updateCheckInterval: parseInt(process.env.SENTINELA_UPDATE_CHECK_INTERVAL || '3600000', 10), // 1 hour
};

// Validate required configuration
export function validateConfig(): string[] {
  const errors: string[] = [];

  if (!config.apiUrl) {
    errors.push('API URL is required');
  }

  if (config.screenshotInterval < 60000) {
    errors.push('Screenshot interval must be at least 60 seconds');
  }

  return errors;
}

export default config;
