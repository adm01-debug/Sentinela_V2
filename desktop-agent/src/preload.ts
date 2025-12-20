import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Screenshots
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  
  // Activity tracking
  getActiveWindow: () => ipcRenderer.invoke('get-active-window'),
  getIdleTime: () => ipcRenderer.invoke('get-idle-time'),
  
  // System info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Config
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (config: any) => ipcRenderer.invoke('set-config', config),
  
  // Auth
  login: (credentials: any) => ipcRenderer.invoke('login', credentials),
  logout: () => ipcRenderer.invoke('logout'),
  
  // Events
  onMessage: (callback: (message: any) => void) => {
    ipcRenderer.on('message', (_, message) => callback(message));
  },
});
