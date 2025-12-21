import { ipcMain, ipcRenderer, BrowserWindow } from 'electron';

// IPC Channels
export const IPC_CHANNELS = {
  // Activity
  ACTIVITY_START: 'activity:start',
  ACTIVITY_STOP: 'activity:stop',
  ACTIVITY_DATA: 'activity:data',
  
  // Screenshot
  SCREENSHOT_CAPTURE: 'screenshot:capture',
  SCREENSHOT_CAPTURED: 'screenshot:captured',
  
  // Config
  CONFIG_GET: 'config:get',
  CONFIG_SET: 'config:set',
  CONFIG_UPDATED: 'config:updated',
  
  // Auth
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_STATUS: 'auth:status',
  
  // System
  SYSTEM_INFO: 'system:info',
  SYSTEM_QUIT: 'system:quit',
};

// Main process handlers
export function setupIpcHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle(IPC_CHANNELS.CONFIG_GET, async () => {
    const Store = require('electron-store');
    const store = new Store();
    return store.get('config');
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG_SET, async (_event, config) => {
    const Store = require('electron-store');
    const store = new Store();
    store.set('config', config);
    mainWindow.webContents.send(IPC_CHANNELS.CONFIG_UPDATED, config);
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM_INFO, async () => {
    const os = require('os');
    return {
      platform: os.platform(),
      hostname: os.hostname(),
      username: os.userInfo().username,
      memory: os.totalmem(),
      cpus: os.cpus().length,
    };
  });
}

// Renderer process API
export const ipcAPI = {
  getConfig: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET),
  setConfig: (config: unknown) => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_SET, config),
  getSystemInfo: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_INFO),
  onConfigUpdated: (callback: (config: unknown) => void) => {
    ipcRenderer.on(IPC_CHANNELS.CONFIG_UPDATED, (_event, config) => callback(config));
  },
};
