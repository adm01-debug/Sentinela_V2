// Stream Windowing
export type WindowType = "tumbling" | "sliding" | "session";
export interface Window<T> { start: Date; end: Date; items: T[]; }
export class WindowProcessor<T> {
  private windows: Window<T>[] = [];
  constructor(private windowSize: number, private type: WindowType = "tumbling") {}
  add(item: T, timestamp: Date = new Date()): void {
    const windowStart = new Date(Math.floor(timestamp.getTime() / this.windowSize) * this.windowSize);
    const windowEnd = new Date(windowStart.getTime() + this.windowSize);
    let window = this.windows.find(w => w.start.getTime() === windowStart.getTime());
    if (!window) { window = { start: windowStart, end: windowEnd, items: [] }; this.windows.push(window); }
    window.items.push(item);
  }
  getCompletedWindows(): Window<T>[] { const now = Date.now(); return this.windows.filter(w => w.end.getTime() <= now); }
  clear(): void { this.windows = this.windows.filter(w => w.end.getTime() > Date.now()); }
}
