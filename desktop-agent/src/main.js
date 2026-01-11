const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const { ActivityTracker } = require('./trackers/activity');
const { ScreenshotCapture } = require('./trackers/screenshot');
const { ApiService } = require('./services/api');
const { ConfigManager } = require('./services/config');
let mainWindow, tray, activityTracker, screenshotCapture;
const config = ConfigManager.load();
const api = new ApiService(config.apiUrl);
function createWindow() {
  mainWindow = new BrowserWindow({ width: 400, height: 300, show: false, frame: false, resizable: false, webPreferences: { nodeIntegration: true, contextIsolation: false } });
  mainWindow.loadFile('index.html');
  mainWindow.on('close', (e) => { e.preventDefault(); mainWindow.hide(); });
}
function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow.show() },
    { label: 'Status: Active', enabled: false },
    { type: 'separator' },
    { label: 'Pause Tracking', click: () => pauseTracking() },
    { label: 'Settings', click: () => openSettings() },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuiting = true; app.quit(); } }
  ]);
  tray.setToolTip('Sentinela Agent');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow.show());
}
function startTracking() {
  activityTracker = new ActivityTracker(api, config);
  activityTracker.start();
  screenshotCapture = new ScreenshotCapture(api, config);
  screenshotCapture.start();
}
function pauseTracking() { activityTracker?.pause(); screenshotCapture?.pause(); }
app.whenReady().then(() => { createWindow(); createTray(); startTracking(); });
app.on('window-all-closed', (e) => e.preventDefault());
ipcMain.handle('get-status', () => ({ active: activityTracker?.isActive, uptime: process.uptime() }));