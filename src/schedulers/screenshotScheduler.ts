type ScreenshotCallback = () => void;
class ScreenshotScheduler {
  private interval: NodeJS.Timeout | null = null;
  private callback: ScreenshotCallback | null = null;
  start(callback: ScreenshotCallback, intervalMs = 300000) { this.callback = callback; this.interval = setInterval(callback, intervalMs); }
  stop() { if (this.interval) { clearInterval(this.interval); this.interval = null; } }
  trigger() { this.callback?.(); }
  get isRunning() { return this.interval !== null; }
}
export const screenshotScheduler = new ScreenshotScheduler();
