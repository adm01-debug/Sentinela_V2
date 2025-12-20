// ============================================================
// AUTO UPDATER SERVICE
// Handles automatic updates for the desktop agent using electron-updater
// ============================================================

import { autoUpdater } from 'electron-updater';
import { BrowserWindow, ipcMain, app } from 'electron';
import { config } from '../config';

// ============================================================
// TYPES
// ============================================================

interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
}

interface UpdateProgress {
  percent: number;
  transferred: number;
  total: number;
  bytesPerSecond: number;
}

// ============================================================
// AUTO UPDATER SERVICE
// ============================================================

export class AutoUpdaterService {
  private mainWindow: BrowserWindow | null = null;
  private updateCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupAutoUpdater();
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  private setupAutoUpdater() {
    // Configure auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.autoRunAppAfterInstall = true;

    // Set update server URL if configured
    if (config.updateServerUrl) {
      autoUpdater.setFeedURL({
        provider: 'generic',
        url: config.updateServerUrl,
      });
    }

    // Event handlers
    autoUpdater.on('checking-for-update', () => {
      console.log('[AutoUpdater] Checking for updates...');
      this.sendStatusToWindow('checking-for-update');
    });

    autoUpdater.on('update-available', (info: UpdateInfo) => {
      console.log('[AutoUpdater] Update available:', info.version);
      this.sendStatusToWindow('update-available', info);
    });

    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      console.log('[AutoUpdater] No updates available. Current version:', app.getVersion());
      this.sendStatusToWindow('update-not-available', info);
    });

    autoUpdater.on('error', (error: Error) => {
      console.error('[AutoUpdater] Error:', error.message);
      this.sendStatusToWindow('error', { message: error.message });
    });

    autoUpdater.on('download-progress', (progress: UpdateProgress) => {
      console.log(`[AutoUpdater] Download progress: ${progress.percent.toFixed(2)}%`);
      this.sendStatusToWindow('download-progress', progress);
    });

    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      console.log('[AutoUpdater] Update downloaded:', info.version);
      this.sendStatusToWindow('update-downloaded', info);
    });
  }

  // ============================================================
  // PUBLIC METHODS
  // ============================================================

  /**
   * Set the main window for IPC communication
   */
  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  /**
   * Check for updates manually
   */
  async checkForUpdates(): Promise<void> {
    try {
      console.log('[AutoUpdater] Manually checking for updates...');
      await autoUpdater.checkForUpdates();
    } catch (error) {
      console.error('[AutoUpdater] Error checking for updates:', error);
    }
  }

  /**
   * Download the available update
   */
  async downloadUpdate(): Promise<void> {
    try {
      console.log('[AutoUpdater] Starting download...');
      await autoUpdater.downloadUpdate();
    } catch (error) {
      console.error('[AutoUpdater] Error downloading update:', error);
    }
  }

  /**
   * Quit and install the downloaded update
   */
  quitAndInstall(): void {
    console.log('[AutoUpdater] Quitting and installing update...');
    autoUpdater.quitAndInstall(false, true);
  }

  /**
   * Start automatic update checks at the configured interval
   */
  startAutoUpdateCheck(intervalMs: number = 3600000): void {
    // Check immediately on start
    this.checkForUpdates();

    // Then check periodically
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, intervalMs);

    console.log(`[AutoUpdater] Auto-update check started. Interval: ${intervalMs}ms`);
  }

  /**
   * Stop automatic update checks
   */
  stopAutoUpdateCheck(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
      console.log('[AutoUpdater] Auto-update check stopped');
    }
  }

  /**
   * Get current app version
   */
  getCurrentVersion(): string {
    return app.getVersion();
  }

  // ============================================================
  // IPC HANDLERS
  // ============================================================

  /**
   * Setup IPC handlers for renderer communication
   */
  setupIpcHandlers(): void {
    ipcMain.handle('updater:check', async () => {
      await this.checkForUpdates();
    });

    ipcMain.handle('updater:download', async () => {
      await this.downloadUpdate();
    });

    ipcMain.handle('updater:install', () => {
      this.quitAndInstall();
    });

    ipcMain.handle('updater:version', () => {
      return this.getCurrentVersion();
    });
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  /**
   * Send update status to the renderer window
   */
  private sendStatusToWindow(status: string, data?: unknown): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('updater:status', { status, data });
    }
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

let autoUpdaterService: AutoUpdaterService | null = null;

export function getAutoUpdaterService(): AutoUpdaterService {
  if (!autoUpdaterService) {
    autoUpdaterService = new AutoUpdaterService();
  }
  return autoUpdaterService;
}

export default AutoUpdaterService;
