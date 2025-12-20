import { desktopCapturer, screen } from 'electron';

export class ScreenshotService {
  private interval: NodeJS.Timeout | null = null;
  
  async capture(): Promise<string | null> {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });
    
    if (sources.length > 0) {
      return sources[0].thumbnail.toDataURL();
    }
    return null;
  }
  
  start(intervalMs: number) {
    this.interval = setInterval(() => this.capture(), intervalMs);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
