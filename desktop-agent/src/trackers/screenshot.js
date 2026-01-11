const { desktopCapturer, screen } = require('electron');
const fs = require('fs');
const path = require('path');
class ScreenshotCapture {
  constructor(api, config) { this.api = api; this.config = config; this.isActive = false; this.tempDir = path.join(require('os').tmpdir(), 'sentinela-screenshots'); if (!fs.existsSync(this.tempDir)) fs.mkdirSync(this.tempDir, { recursive: true }); }
  start() {
    this.isActive = true;
    this.captureInterval = setInterval(() => this.capture(), (this.config.screenshotInterval || 5) * 60 * 1000);
  }
  async capture() {
    if (!this.isActive) return;
    try {
      const displays = screen.getAllDisplays();
      const primaryDisplay = displays.find(d => d.bounds.x === 0 && d.bounds.y === 0) || displays[0];
      const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: primaryDisplay.bounds.width, height: primaryDisplay.bounds.height } });
      const source = sources[0];
      if (source) {
        const filename = 'screenshot-' + Date.now() + '.png';
        const filepath = path.join(this.tempDir, filename);
        fs.writeFileSync(filepath, source.thumbnail.toPNG());
        await this.upload(filepath);
        fs.unlinkSync(filepath);
      }
    } catch (err) { console.error('Screenshot error:', err); }
  }
  async upload(filepath) {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('screenshot', fs.createReadStream(filepath));
    form.append('timestamp', new Date().toISOString());
    await this.api.upload('/screenshots', form);
  }
  pause() { this.isActive = false; }
  resume() { this.isActive = true; }
  stop() { clearInterval(this.captureInterval); this.isActive = false; }
}
module.exports = { ScreenshotCapture };