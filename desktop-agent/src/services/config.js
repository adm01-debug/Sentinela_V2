const fs = require('fs');
const path = require('path');
const os = require('os');
const configPath = path.join(os.homedir(), '.sentinela', 'config.json');
const defaultConfig = {
  apiUrl: 'https://api.sentinela.com',
  trackingInterval: 5000,
  syncInterval: 30000,
  screenshotInterval: 5,
  idleThreshold: 300,
  startOnLogin: true,
  minimizeToTray: true,
  notifications: true
};
class ConfigManager {
  static load() {
    try {
      if (fs.existsSync(configPath)) { return { ...defaultConfig, ...JSON.parse(fs.readFileSync(configPath, 'utf8')) }; }
    } catch (err) { console.error('Config load error:', err); }
    return defaultConfig;
  }
  static save(config) {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
  static reset() { this.save(defaultConfig); return defaultConfig; }
}
module.exports = { ConfigManager };