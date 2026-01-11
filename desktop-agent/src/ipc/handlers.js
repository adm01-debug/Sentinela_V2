const { ipcMain } = require('electron');
function setupIpcHandlers(services) {
  const { tracker, config, api, updater } = services;
  ipcMain.handle('get-status', () => ({ active: tracker.isActive, uptime: process.uptime(), stats: tracker.getStats() }));
  ipcMain.handle('get-config', () => config.load());
  ipcMain.handle('save-config', (_, newConfig) => { config.save(newConfig); return true; });
  ipcMain.handle('pause-tracking', () => { tracker.pause(); return true; });
  ipcMain.handle('resume-tracking', () => { tracker.resume(); return true; });
  ipcMain.handle('login', async (_, credentials) => {
    const result = await api.post('/auth/login', credentials);
    if (result.token) { api.setToken(result.token); config.save({ ...config.load(), token: result.token }); }
    return result;
  });
  ipcMain.handle('logout', () => { api.setToken(null); config.save({ ...config.load(), token: null }); return true; });
  ipcMain.handle('check-updates', () => updater.checkForUpdates());
}
module.exports = { setupIpcHandlers };