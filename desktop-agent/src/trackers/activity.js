const { powerMonitor } = require('electron');
const activeWindow = require('active-win');
class ActivityTracker {
  constructor(api, config) { this.api = api; this.config = config; this.isActive = false; this.buffer = []; this.idleThreshold = config.idleThreshold || 300; }
  start() {
    this.isActive = true;
    this.trackingInterval = setInterval(() => this.track(), this.config.trackingInterval || 5000);
    this.syncInterval = setInterval(() => this.sync(), this.config.syncInterval || 30000);
    powerMonitor.on('suspend', () => this.pause());
    powerMonitor.on('resume', () => this.resume());
    powerMonitor.on('lock-screen', () => this.logIdle());
    powerMonitor.on('unlock-screen', () => this.resume());
  }
  async track() {
    if (!this.isActive) return;
    const idle = powerMonitor.getSystemIdleTime();
    if (idle > this.idleThreshold) { this.logIdle(); return; }
    try {
      const win = await activeWindow();
      if (win) this.buffer.push({ application: win.owner.name, title: win.title, timestamp: new Date().toISOString(), duration: 5 });
    } catch (err) { console.error('Track error:', err); }
  }
  async sync() {
    if (this.buffer.length === 0) return;
    const activities = [...this.buffer];
    this.buffer = [];
    try { await this.api.post('/activities/batch', { activities }); }
    catch (err) { console.error('Sync error:', err); this.buffer.unshift(...activities); }
  }
  logIdle() { this.buffer.push({ application: 'IDLE', title: '', timestamp: new Date().toISOString(), duration: 0 }); }
  pause() { this.isActive = false; }
  resume() { this.isActive = true; }
  stop() { clearInterval(this.trackingInterval); clearInterval(this.syncInterval); this.isActive = false; }
}
module.exports = { ActivityTracker };