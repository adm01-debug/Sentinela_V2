import { WindowConfig, StreamEvent } from './types';

export class WindowedStream<T> {
  private windows: Map<string, WindowBuffer<T>> = new Map();
  
  constructor(private config: WindowConfig) {}
  
  add(event: StreamEvent<T>): WindowResult<T>[] {
    const windowKey = this.getWindowKey(event.timestamp);
    let buffer = this.windows.get(windowKey);
    
    if (!buffer) {
      buffer = new WindowBuffer<T>(this.config.size);
      this.windows.set(windowKey, buffer);
    }
    
    buffer.add(event);
    return this.emitCompletedWindows();
  }
  
  private getWindowKey(timestamp: Date): string {
    const time = timestamp.getTime();
    const windowStart = Math.floor(time / this.config.size) * this.config.size;
    return windowStart.toString();
  }
  
  private emitCompletedWindows(): WindowResult<T>[] {
    const now = Date.now();
    const results: WindowResult<T>[] = [];
    
    for (const [key, buffer] of this.windows) {
      const windowEnd = parseInt(key) + this.config.size;
      if (now >= windowEnd) {
        results.push({ windowStart: new Date(parseInt(key)), windowEnd: new Date(windowEnd), events: buffer.getEvents() });
        this.windows.delete(key);
      }
    }
    
    return results;
  }
}

class WindowBuffer<T> {
  private events: StreamEvent<T>[] = [];
  constructor(private maxSize: number) {}
  add(event: StreamEvent<T>): void { this.events.push(event); }
  getEvents(): StreamEvent<T>[] { return [...this.events]; }
}

export interface WindowResult<T> { windowStart: Date; windowEnd: Date; events: StreamEvent<T>[]; }