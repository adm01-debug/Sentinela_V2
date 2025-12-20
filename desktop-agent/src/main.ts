import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron';
import path from 'path';
import { ScreenshotService, ActivityService, SyncService, ConfigService } from './services';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const configService = new ConfigService();
const screenshotService = new ScreenshotService();
const activityService = new ActivityService();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../views/index.html'));
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../resources/icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow?.show() },
    { label: 'Quit', click: () => app.quit() },
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip('Sentinela Agent');
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  
  // Start services
  screenshotService.start(configService.get('screenshotInterval'));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('capture-screen', () => screenshotService.capture());
ipcMain.handle('get-active-window', () => activityService.getActiveWindow());
ipcMain.handle('get-idle-time', () => activityService.getIdleTime());
ipcMain.handle('get-config', () => configService.getAll());
ipcMain.handle('set-config', (_, config) => {
  Object.entries(config).forEach(([key, value]) => {
    configService.set(key as any, value);
  });
});
