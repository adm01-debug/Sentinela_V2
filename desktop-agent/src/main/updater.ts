import { autoUpdater } from 'electron-updater';

export function setupAutoUpdater(): void {
  autoUpdater.checkForUpdatesAndNotify();
  
  autoUpdater.on('update-available', () => {
    console.log('Update available');
  });
  
  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
  });
}
