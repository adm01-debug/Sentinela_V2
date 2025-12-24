export class Throttle {
  private lastCall: number = 0;
  private pending: (() => void)[] = [];
  
  constructor(private minIntervalMs: number) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const elapsed = now - this.lastCall;
    
    if (elapsed < this.minIntervalMs) {
      await this.delay(this.minIntervalMs - elapsed);
    }
    
    this.lastCall = Date.now();
    return fn();
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class Debounce {
  private timer?: NodeJS.Timeout;
  private pending?: () => void;
  
  constructor(private delayMs: number) {}
  
  execute(fn: () => void): void {
    if (this.timer) clearTimeout(this.timer);
    this.pending = fn;
    this.timer = setTimeout(() => { this.pending?.(); this.pending = undefined; }, this.delayMs);
  }
  
  cancel(): void {
    if (this.timer) { clearTimeout(this.timer); this.timer = undefined; this.pending = undefined; }
  }
  
  flush(): void {
    if (this.timer) { clearTimeout(this.timer); this.timer = undefined; }
    this.pending?.();
    this.pending = undefined;
  }
}