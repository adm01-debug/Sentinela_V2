import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
import log from 'electron-log';

export class AutoUpdater {
  private mainWindow: BrowserWindow | null = null;

  constructor(win: BrowserWindow) {
    this.mainWindow = win;
    autoUpdater.logger = log;
    this.setupEvents();
  }

  private setupEvents() {
    autoUpdater.on('update-available', () => {
      dialog.showMessageBox({ type: 'info', title: 'Update Available', message: 'A new version is available. Downloading now...' });
    });

    autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox({ type: 'info', title: 'Update Ready', message: 'Update downloaded. Restart to apply?' }).then(result => {
        if (result.response === 0) autoUpdater.quitAndInstall();
      });
    });

    autoUpdater.on('error', (err) => {
      log.error('Update error:', err);
    });
  }

  checkForUpdates() {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

export default AutoUpdater;
