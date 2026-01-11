import { ipcMain } from 'electron';
import { collectActivity } from '../services/collector';
import { syncData } from '../services/sync';

export function setupIPC(): void {
  ipcMain.handle('get-activity', async () => {
    return collectActivity();
  });
  
  ipcMain.handle('sync-data', async () => {
    return syncData();
  });
  
  ipcMain.handle('get-status', async () => {
    return { status: 'running', uptime: process.uptime() };
  });
}
