// Backpressure Handler
export type BackpressureStrategy = "drop" | "buffer" | "throttle" | "block";
export interface BackpressureConfig { strategy: BackpressureStrategy; bufferSize: number; throttleMs: number; }
export class BackpressureHandler<T> {
  private buffer: T[] = []; private lastProcess = 0;
  constructor(private config: BackpressureConfig, private processor: (item: T) => Promise<void>) {}
  async push(item: T): Promise<boolean> {
    switch (this.config.strategy) {
      case "drop": if (this.buffer.length >= this.config.bufferSize) return false; break;
      case "buffer": if (this.buffer.length >= this.config.bufferSize) { await this.flush(); } break;
      case "throttle": const now = Date.now(); if (now - this.lastProcess < this.config.throttleMs) { await new Promise(r => setTimeout(r, this.config.throttleMs - (now - this.lastProcess))); } break;
      case "block": while (this.buffer.length >= this.config.bufferSize) { await new Promise(r => setTimeout(r, 10)); } break;
    }
    this.buffer.push(item); return true;
  }
  async flush(): Promise<void> { while (this.buffer.length > 0) { await this.processor(this.buffer.shift()!); this.lastProcess = Date.now(); } }
  getBufferSize(): number { return this.buffer.length; }
}
