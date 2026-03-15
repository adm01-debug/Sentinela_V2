export const CONFIG = {
  // Backend API
  API_URL: 'https://rmiznlzpbwqpbzaiyydw.supabase.co/functions/v1',
  
  // Screenshot settings
  SCREENSHOT_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
  SCREENSHOT_QUALITY: 80,
  
  // Activity reporting interval
  ACTIVITY_REPORT_INTERVAL_MS: 60 * 1000, // 1 minute
  
  // App tracking interval
  APP_TRACKING_INTERVAL_MS: 5 * 1000, // 5 seconds
  
  // Heartbeat interval  
  HEARTBEAT_INTERVAL_MS: 30 * 1000, // 30 seconds
  
  // Batch send interval
  BATCH_SEND_INTERVAL_MS: 30 * 1000, // 30 seconds
  
  // Max retries for failed sends
  MAX_RETRIES: 3,
  
  // Idle threshold in seconds
  IDLE_THRESHOLD_SECONDS: 300, // 5 minutes

  // Stealth mode
  STEALTH_SHORTCUT: 'CommandOrControl+Shift+Alt+S',
  STEALTH_PASSWORD: '', // Set during installation
  
  // Auto-update
  AUTO_UPDATE_CHECK_INTERVAL_MS: 4 * 60 * 60 * 1000, // 4 hours
  UPDATE_URL: 'https://releases.sentinela.app/agent',

  // Data retention (local cache)
  LOCAL_CACHE_MAX_ITEMS: 1000,
  LOCAL_CACHE_MAX_AGE_MS: 24 * 60 * 60 * 1000, // 24 hours
};
