import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getActivity: () => ipcRenderer.invoke('get-activity'),
  syncData: () => ipcRenderer.invoke('sync-data'),
  getStatus: () => ipcRenderer.invoke('get-status'),
});
