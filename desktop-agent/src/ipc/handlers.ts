import { ipcMain } from 'electron';
export function setupHandlers() { ipcMain.handle('get-status', () => ({ running: true })); }