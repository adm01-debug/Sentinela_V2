const { uIOhook } = require('uiohook-napi');
class MouseTracker {
  constructor(callback) { this.callback = callback; this.clicks = 0; this.distance = 0; this.lastPos = null; }
  start() {
    uIOhook.on('click', () => { this.clicks++; });
    uIOhook.on('mousemove', (e) => {
      if (this.lastPos) { this.distance += Math.sqrt(Math.pow(e.x - this.lastPos.x, 2) + Math.pow(e.y - this.lastPos.y, 2)); }
      this.lastPos = { x: e.x, y: e.y };
    });
    uIOhook.start();
    this.resetInterval = setInterval(() => {
      this.callback({ clicks: this.clicks, distance: Math.round(this.distance) });
      this.clicks = 0; this.distance = 0;
    }, 60000);
  }
  stop() { uIOhook.stop(); clearInterval(this.resetInterval); }
}
module.exports = { MouseTracker };