import { app, BrowserWindow } from 'electron';
import { createWindow } from './window';
import { createTray } from './tray';
import { setupIPC } from './ipc';

app.whenReady().then(() => {
  const mainWindow = createWindow();
  createTray(mainWindow);
  setupIPC();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
