const os = require('os');
class NetworkTracker {
  constructor(callback) { this.callback = callback; this.lastBytes = this.getBytes(); }
  getBytes() {
    const interfaces = os.networkInterfaces();
    let rx = 0, tx = 0;
    Object.values(interfaces).flat().forEach(iface => { if (!iface.internal) { rx += iface.rx_bytes || 0; tx += iface.tx_bytes || 0; } });
    return { rx, tx };
  }
  start() {
    this.interval = setInterval(() => {
      const current = this.getBytes();
      const diff = { rxDelta: current.rx - this.lastBytes.rx, txDelta: current.tx - this.lastBytes.tx };
      this.lastBytes = current;
      this.callback(diff);
    }, 60000);
  }
  stop() { clearInterval(this.interval); }
}
module.exports = { NetworkTracker };