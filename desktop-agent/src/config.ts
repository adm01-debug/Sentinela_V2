// Environment variables should be set during build or via .env file
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // For Electron, we can use process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

export interface Config {
  employeeName: string;
  agentKey: string;
  serverUrl: string;
  deviceName: string;
  
  // Monitoring settings
  keystrokeEnabled: boolean;
  keystrokeInterval: number; // seconds
  
  screenshotEnabled: boolean;
  screenshotInterval: number; // minutes
  
  productivityEnabled: boolean;
  
  usbBlockEnabled: boolean;
  printScreenBlockEnabled: boolean;
  
  // Advanced security
  vpnDetectionEnabled: boolean;
  mouseJigglerDetectionEnabled: boolean;
  
  // Stealth mode
  stealthModeEnabled: boolean;
  hideFromTaskManager: boolean;
  disableExitOption: boolean;
  autoStartWithSystem: boolean;
  
  // SmartBlur
  smartBlurEnabled: boolean;
  smartBlurWhitelist: string[]; // Words/patterns to ignore
  smartBlurWhitelistApps: string[]; // Apps to skip OCR processing
  
  // Geofencing
  geofencingEnabled: boolean;
  geofencingNotifyUser: boolean;
  
  // Supabase credentials (for geofencing)
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Default configuration using environment variables
export const defaultConfig: Config = {
  employeeName: '',
  agentKey: '',
  // Use environment variable for server URL, with fallback
  serverUrl: getEnvVar(
    'AGENT_SERVER_URL', 
    getEnvVar('SUPABASE_URL', '') 
      ? `${getEnvVar('SUPABASE_URL')}/functions/v1/agent-collector`
      : ''
  ),
  deviceName: '',
  
  keystrokeEnabled: true,
  keystrokeInterval: 60,
  
  screenshotEnabled: true,
  screenshotInterval: 5,
  
  productivityEnabled: true,
  
  usbBlockEnabled: true,
  printScreenBlockEnabled: true,
  
  // Advanced security defaults
  vpnDetectionEnabled: true,
  mouseJigglerDetectionEnabled: true,
  
  // Stealth mode defaults
  stealthModeEnabled: false,
  hideFromTaskManager: false,
  disableExitOption: false,
  autoStartWithSystem: true,
  
  // SmartBlur defaults
  smartBlurEnabled: true,
  smartBlurWhitelist: [],
  smartBlurWhitelistApps: [],
  
  // Geofencing defaults
  geofencingEnabled: false,
  geofencingNotifyUser: true,
  
  // Supabase credentials from environment
  supabaseUrl: getEnvVar('SUPABASE_URL', ''),
  supabaseAnonKey: getEnvVar('SUPABASE_ANON_KEY', ''),
};

// Validate configuration
export function validateConfig(config: Config): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.serverUrl) {
    errors.push('serverUrl é obrigatório. Configure AGENT_SERVER_URL ou SUPABASE_URL.');
  }
  
  if (config.geofencingEnabled && (!config.supabaseUrl || !config.supabaseAnonKey)) {
    errors.push('Geofencing requer SUPABASE_URL e SUPABASE_ANON_KEY configurados.');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
