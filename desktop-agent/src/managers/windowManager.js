const { BrowserWindow, screen } = require('electron');
const path = require('path');
class WindowManager {
  constructor() { this.windows = new Map(); }
  createMain() {
    const win = new BrowserWindow({
      width: 400, height: 300, show: false, frame: false, resizable: false, skipTaskbar: true,
      webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
    win.on('close', (e) => { e.preventDefault(); win.hide(); });
    this.windows.set('main', win);
    return win;
  }
  createSettings() {
    if (this.windows.has('settings')) { this.windows.get('settings').show(); return; }
    const win = new BrowserWindow({
      width: 500, height: 600, resizable: false, parent: this.windows.get('main'), modal: true,
      webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    win.loadFile(path.join(__dirname, '..', 'renderer', 'settings.html'));
    win.on('closed', () => this.windows.delete('settings'));
    this.windows.set('settings', win);
    return win;
  }
  getMain() { return this.windows.get('main'); }
}
module.exports = { WindowManager };