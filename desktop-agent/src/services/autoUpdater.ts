import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { BrowserWindow } from 'electron';
import { CONFIG } from '../config';

export class AutoUpdaterService {
  private checkTimer: NodeJS.Timeout | null = null;

  constructor() {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info.version);
      const windows = BrowserWindow.getAllWindows();
      windows.forEach(w => w.webContents.send('update-available', info));
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info.version);
      // Auto-install on next restart
    });

    autoUpdater.on('error', (error) => {
      log.error('Auto-update error:', error);
    });
  }

  start(): void {
    log.info('Auto-updater service started');
    this.checkForUpdates();
    this.checkTimer = setInterval(() => this.checkForUpdates(), CONFIG.AUTO_UPDATE_CHECK_INTERVAL_MS);
  }

  stop(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }

  async checkForUpdates(): Promise<void> {
    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      log.error('Update check failed:', error);
    }
  }
}
