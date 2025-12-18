import { app, BrowserWindow, Tray, Menu, nativeImage, dialog, globalShortcut } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import { MonitoringService } from './services/monitoring';
import { ApiService } from './services/api';
import { Config } from './config';
import { exec } from 'child_process';

const store = new Store();
let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let monitoringService: MonitoringService | null = null;
let isStealthMode = false;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow && !isStealthMode) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    // Check if configured
    const config = store.get('config') as Config | undefined;
    
    if (!config || !config.employeeName || !config.agentKey) {
      createConfigWindow();
    } else {
      isStealthMode = config.stealthModeEnabled || false;
      startMonitoring(config);
    }

    // Only create tray if not in stealth mode
    if (!isStealthMode) {
      createTray();
    }
    
    // Configure auto-start
    if (config?.autoStartWithSystem) {
      configureAutoStart(true);
    }
    
    // Hide from task manager on Windows (stealth mode)
    if (isStealthMode && config?.hideFromTaskManager && process.platform === 'win32') {
      hideFromTaskManager();
    }
  });
}

function createConfigWindow() {
  // Don't allow config window in stealth mode after initial setup
  const config = store.get('config') as Config | undefined;
  if (config?.stealthModeEnabled && config?.employeeName) {
    return;
  }

  mainWindow = new BrowserWindow({
    width: 500,
    height: 750,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, '../views/config.html'));
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  if (isStealthMode) return;
  
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  updateTrayMenu();
}

function updateTrayMenu(blockStatus?: { isBlocked: boolean; reason: string }) {
  if (!tray || isStealthMode) return;

  const config = store.get('config') as Config | undefined;
  const statusLabel = blockStatus?.isBlocked 
    ? `Status: 🔒 Bloqueado - ${blockStatus.reason}`
    : 'Status: ✅ Monitorando';

  const menuItems: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'SecureWatch Agent',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: statusLabel,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Configurações',
      click: () => {
        if (!mainWindow) createConfigWindow();
        else mainWindow.focus();
      },
    },
  ];

  // Only show exit option if not disabled
  if (!config?.disableExitOption) {
    menuItems.push(
      { type: 'separator' },
      {
        label: 'Sair',
        click: () => {
          if (monitoringService) monitoringService.stop();
          app.quit();
        },
      }
    );
  }

  const contextMenu = Menu.buildFromTemplate(menuItems);

  const tooltip = blockStatus?.isBlocked 
    ? `SecureWatch Agent - Bloqueado: ${blockStatus.reason}`
    : 'SecureWatch Agent - Monitorando';

  tray.setToolTip(tooltip);
  tray.setContextMenu(contextMenu);
}

async function startMonitoring(config: Config) {
  console.log('Starting monitoring for:', config.employeeName);
  console.log('Stealth mode:', config.stealthModeEnabled ? 'ENABLED' : 'DISABLED');
  
  const apiService = new ApiService(config);
  monitoringService = new MonitoringService(config, apiService);
  
  // Set callback to update tray when block status changes
  monitoringService.setBlockStatusCallback((blocked, reason) => {
    if (!isStealthMode) {
      updateTrayMenu({ isBlocked: blocked, reason });
    }
  });
  
  await monitoringService.start();
  
  // Show monitoring notice only if not in stealth mode
  if (!isStealthMode) {
    showMonitoringNotice();
  }
  
  // Register secret admin shortcut for stealth mode (Ctrl+Shift+Alt+S)
  if (isStealthMode) {
    globalShortcut.register('CommandOrControl+Shift+Alt+S', () => {
      showAdminAccessDialog();
    });
  }
}

function showMonitoringNotice() {
  if (isStealthMode) return;
  
  const noticeWindow = new BrowserWindow({
    width: 400,
    height: 120,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  noticeWindow.loadFile(path.join(__dirname, '../views/notice.html'));
  noticeWindow.setPosition(20, 20);

  // Auto-hide after 10 seconds
  setTimeout(() => {
    noticeWindow.close();
  }, 10000);
}

function showAdminAccessDialog() {
  // Secret admin access for stealth mode
  const adminWindow = new BrowserWindow({
    width: 400,
    height: 200,
    frame: true,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  adminWindow.loadFile(path.join(__dirname, '../views/admin-access.html'));
}

function configureAutoStart(enable: boolean) {
  app.setLoginItemSettings({
    openAtLogin: enable,
    openAsHidden: isStealthMode,
    path: process.execPath,
    args: isStealthMode ? ['--hidden'] : [],
  });
}

function hideFromTaskManager() {
  // On Windows, rename the process to something innocuous
  if (process.platform === 'win32') {
    try {
      // Set the app user model ID to something less suspicious
      app.setAppUserModelId('Microsoft.Windows.SystemService');
    } catch (e) {
      console.error('Failed to hide from task manager:', e);
    }
  }
}

// Handle config save from renderer
import { ipcMain } from 'electron';

ipcMain.on('save-config', (event, config: Config) => {
  store.set('config', config);
  isStealthMode = config.stealthModeEnabled || false;
  
  if (mainWindow) mainWindow.close();
  
  // Recreate or destroy tray based on stealth mode
  if (isStealthMode && tray) {
    tray.destroy();
    tray = null;
  } else if (!isStealthMode && !tray) {
    createTray();
  }
  
  // Configure auto-start
  configureAutoStart(config.autoStartWithSystem);
  
  startMonitoring(config);
});

ipcMain.on('get-config', (event) => {
  event.returnValue = store.get('config') || {};
});

ipcMain.on('admin-verify', (event, password: string) => {
  // Simple admin password verification (should be configurable)
  const adminPassword = store.get('adminPassword') || 'SecureWatch2024!';
  event.returnValue = password === adminPassword;
});

ipcMain.on('exit-stealth', () => {
  isStealthMode = false;
  createTray();
  createConfigWindow();
});

app.on('window-all-closed', () => {
  // Keep running in tray (or background in stealth mode)
});

app.on('before-quit', () => {
  globalShortcut.unregisterAll();
  if (monitoringService) monitoringService.stop();
});
