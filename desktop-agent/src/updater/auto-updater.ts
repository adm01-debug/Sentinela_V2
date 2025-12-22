import { autoUpdater } from 'electron-updater';
export function initAutoUpdater() { autoUpdater.checkForUpdatesAndNotify(); }