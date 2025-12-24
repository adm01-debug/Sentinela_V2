import { StreamEvent, WindowConfig } from './types';

export class WindowOperator<T> {
  private windows: Map<string, WindowBuffer<T>> = new Map();
  
  constructor(private config: WindowConfig) {}
  
  add(event: StreamEvent<T>): void {
    const windowKey = this.getWindowKey(event.timestamp);
    let window = this.windows.get(windowKey);
    if (!window) { window = new WindowBuffer(this.config); this.windows.set(windowKey, window); }
    window.add(event);
  }
  
  private getWindowKey(timestamp: Date): string {
    const time = timestamp.getTime();
    return String(Math.floor(time / this.config.size) * this.config.size);
  }
  
  getWindow(key: string): StreamEvent<T>[] { return this.windows.get(key)?.getEvents() ?? []; }
  
  closeExpiredWindows(currentTime: Date): Map<string, StreamEvent<T>[]> {
    const closed = new Map<string, StreamEvent<T>[]>();
    const threshold = currentTime.getTime() - this.config.size;
    for (const [key, window] of this.windows) {
      if (parseInt(key) < threshold) { closed.set(key, window.getEvents()); this.windows.delete(key); }
    }
    return closed;
  }
}

export class WindowBuffer<T> {
  private events: StreamEvent<T>[] = [];
  constructor(private config: WindowConfig) {}
  add(event: StreamEvent<T>): void { this.events.push(event); }
  getEvents(): StreamEvent<T>[] { return [...this.events]; }
  clear(): void { this.events = []; }
  size(): number { return this.events.length; }
}