const { autoUpdater } = require('electron-updater');
const { ipcMain } = require('electron');
class AutoUpdater {
  constructor(mainWindow) { this.mainWindow = mainWindow; this.setupListeners(); }
  setupListeners() {
    autoUpdater.on('checking-for-update', () => this.sendStatus('checking'));
    autoUpdater.on('update-available', () => this.sendStatus('available'));
    autoUpdater.on('update-not-available', () => this.sendStatus('not-available'));
    autoUpdater.on('download-progress', (p) => this.sendStatus('downloading', p.percent));
    autoUpdater.on('update-downloaded', () => { this.sendStatus('downloaded'); setTimeout(() => autoUpdater.quitAndInstall(), 5000); });
    autoUpdater.on('error', (err) => this.sendStatus('error', err.message));
    ipcMain.handle('check-updates', () => autoUpdater.checkForUpdates());
    ipcMain.handle('install-update', () => autoUpdater.quitAndInstall());
  }
  sendStatus(status, data) { this.mainWindow?.webContents.send('update-status', { status, data }); }
  checkForUpdates() { autoUpdater.checkForUpdates(); }
}
module.exports = { AutoUpdater };