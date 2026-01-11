const { uIOhook, UiohookKey } = require('uiohook-napi');
class KeyboardTracker {
  constructor(callback) { this.callback = callback; this.keyCount = 0; this.lastReset = Date.now(); }
  start() {
    uIOhook.on('keydown', () => { this.keyCount++; });
    uIOhook.start();
    this.resetInterval = setInterval(() => {
      const count = this.keyCount;
      this.keyCount = 0;
      const elapsed = (Date.now() - this.lastReset) / 1000 / 60;
      this.lastReset = Date.now();
      this.callback({ keystrokes: count, kpm: Math.round(count / elapsed) });
    }, 60000);
  }
  stop() { uIOhook.stop(); clearInterval(this.resetInterval); }
}
module.exports = { KeyboardTracker };