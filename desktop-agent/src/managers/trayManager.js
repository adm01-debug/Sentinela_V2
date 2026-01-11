const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');
class TrayManager {
  constructor(mainWindow, handlers) { this.mainWindow = mainWindow; this.handlers = handlers; this.isTracking = true; }
  create() {
    const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
    this.tray = new Tray(nativeImage.createFromPath(iconPath));
    this.updateMenu();
    this.tray.setToolTip('Sentinela Agent');
    this.tray.on('double-click', () => this.mainWindow.show());
    return this.tray;
  }
  updateMenu() {
    const menu = Menu.buildFromTemplate([
      { label: 'Show', click: () => this.mainWindow.show() },
      { label: 'Status: ' + (this.isTracking ? 'Active' : 'Paused'), enabled: false },
      { type: 'separator' },
      { label: this.isTracking ? 'Pause' : 'Resume', click: () => this.toggleTracking() },
      { label: 'Settings', click: () => this.handlers.openSettings() },
      { type: 'separator' },
      { label: 'Quit', click: () => this.handlers.quit() }
    ]);
    this.tray.setContextMenu(menu);
  }
  toggleTracking() { this.isTracking = !this.isTracking; this.handlers.toggleTracking(this.isTracking); this.updateMenu(); }
  setStatus(active) { this.isTracking = active; this.updateMenu(); }
}
module.exports = { TrayManager };