export interface ErrorRecord { message: string; stack?: string; timestamp: Date; count: number; }
export class ErrorMonitor {
  private errors = new Map<string, ErrorRecord>();
  capture(error: Error): void { const key = error.message; const existing = this.errors.get(key); if (existing) { existing.count++; existing.timestamp = new Date(); } else { this.errors.set(key, { message: error.message, stack: error.stack, timestamp: new Date(), count: 1 }); } }
  getErrors(): ErrorRecord[] { return Array.from(this.errors.values()); }
  getTopErrors(count = 10): ErrorRecord[] { return this.getErrors().sort((a, b) => b.count - a.count).slice(0, count); }
  clear(): void { this.errors.clear(); }
  setupGlobalHandler(): void { window.onerror = (msg, _url, _line, _col, error) => { if (error) this.capture(error); else this.capture(new Error(String(msg))); }; }
}
export const errorMonitor = new ErrorMonitor();
