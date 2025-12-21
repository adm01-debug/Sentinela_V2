import { autoUpdater } from 'electron-updater';
import { app, dialog } from 'electron';
import { logger } from './logger';

class UpdateManager {
  private updateAvailable = false;

  init() {
    autoUpdater.logger = {
      info: (msg: string) => logger.info('[Updater]', msg),
      warn: (msg: string) => logger.warn('[Updater]', msg),
      error: (msg: string) => logger.error('[Updater]', msg),
    };

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
      logger.info('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      logger.info('Update available', info);
      this.updateAvailable = true;
      this.promptUpdate(info.version);
    });

    autoUpdater.on('update-not-available', () => {
      logger.info('No updates available');
    });

    autoUpdater.on('download-progress', (progress) => {
      logger.info(`Download progress: ${progress.percent.toFixed(1)}%`);
    });

    autoUpdater.on('update-downloaded', () => {
      logger.info('Update downloaded');
      this.promptRestart();
    });

    autoUpdater.on('error', (err) => {
      logger.error('Update error', err);
    });
  }

  async checkForUpdates() {
    try {
      await autoUpdater.checkForUpdates();
    } catch (err) {
      logger.error('Check for updates failed', err);
    }
  }

  private async promptUpdate(version: string) {
    const { response } = await dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `A new version (${version}) is available. Download now?`,
      buttons: ['Download', 'Later'],
    });

    if (response === 0) {
      autoUpdater.downloadUpdate();
    }
  }

  private async promptRestart() {
    const { response } = await dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. Restart to apply?',
      buttons: ['Restart', 'Later'],
    });

    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  }
}

export const updater = new UpdateManager();
