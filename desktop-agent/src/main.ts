import { app, BrowserWindow, Tray, Menu, nativeImage, dialog } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import { MonitoringService } from './services/monitoring';
import { ApiService } from './services/api';
import { Config } from './config';

const store = new Store();
let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let monitoringService: MonitoringService | null = null;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
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
      startMonitoring(config);
    }

    createTray();
  });
}

function createConfigWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
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
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'SecureWatch Agent',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Status: Monitorando',
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
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        if (monitoringService) monitoringService.stop();
        app.quit();
      },
    },
  ]);

  tray.setToolTip('SecureWatch Agent - Monitorando');
  tray.setContextMenu(contextMenu);
}

async function startMonitoring(config: Config) {
  console.log('Starting monitoring for:', config.employeeName);
  
  const apiService = new ApiService(config);
  monitoringService = new MonitoringService(config, apiService);
  
  await monitoringService.start();
  
  // Show monitoring notice
  showMonitoringNotice();
}

function showMonitoringNotice() {
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

// Handle config save from renderer
import { ipcMain } from 'electron';

ipcMain.on('save-config', (event, config: Config) => {
  store.set('config', config);
  if (mainWindow) mainWindow.close();
  startMonitoring(config);
});

ipcMain.on('get-config', (event) => {
  event.returnValue = store.get('config') || {};
});

app.on('window-all-closed', () => {
  // Keep running in tray
});

app.on('before-quit', () => {
  if (monitoringService) monitoringService.stop();
});
