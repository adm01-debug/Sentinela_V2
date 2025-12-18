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
}

export const defaultConfig: Config = {
  employeeName: '',
  agentKey: '',
  serverUrl: 'https://rmiznlzpbwqpbzaiyydw.supabase.co/functions/v1/agent-collector',
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
};
