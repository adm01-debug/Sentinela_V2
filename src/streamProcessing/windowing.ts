import { WindowConfig, StreamRecord } from './types';

export class Window<T> {
  private records: StreamRecord<T>[] = [];
  constructor(public readonly start: Date, public readonly end: Date) {}
  
  add(record: StreamRecord<T>): void { this.records.push(record); }
  getRecords(): StreamRecord<T>[] { return [...this.records]; }
  size(): number { return this.records.length; }
}

export class TumblingWindow<T> {
  private windows: Map<number, Window<T>> = new Map();
  constructor(private sizeMs: number) {}
  
  assign(record: StreamRecord<T>): Window<T> {
    const windowStart = Math.floor(record.timestamp.getTime() / this.sizeMs) * this.sizeMs;
    let window = this.windows.get(windowStart);
    if (!window) { window = new Window<T>(new Date(windowStart), new Date(windowStart + this.sizeMs)); this.windows.set(windowStart, window); }
    window.add(record);
    return window;
  }
  
  getExpiredWindows(currentTime: Date): Window<T>[] {
    const expired: Window<T>[] = [];
    this.windows.forEach((window, start) => {
      if (window.end.getTime() <= currentTime.getTime()) { expired.push(window); this.windows.delete(start); }
    });
    return expired;
  }
}

export class SlidingWindow<T> {
  private records: Array<{ record: StreamRecord<T>; expireAt: number }> = [];
  constructor(private sizeMs: number, private slideMs: number) {}
  
  add(record: StreamRecord<T>): void {
    this.records.push({ record, expireAt: record.timestamp.getTime() + this.sizeMs });
    this.cleanup(record.timestamp);
  }
  
  getWindow(timestamp: Date): StreamRecord<T>[] {
    const cutoff = timestamp.getTime() - this.sizeMs;
    return this.records.filter(r => r.record.timestamp.getTime() >= cutoff).map(r => r.record);
  }
  
  private cleanup(currentTime: Date): void {
    this.records = this.records.filter(r => r.expireAt > currentTime.getTime());
  }
}