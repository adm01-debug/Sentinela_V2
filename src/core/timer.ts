/**
 * @fileoverview Timer utilities
 * @module @sentinela/core/timer
 */
export class Timer {
  private start: number = 0;
  private elapsed: number = 0;
  private running = false;
  begin(): void { this.start = Date.now(); this.running = true; }
  stop(): number { if (this.running) { this.elapsed = Date.now() - this.start; this.running = false; } return this.elapsed; }
  reset(): void { this.elapsed = 0; this.running = false; }
  getElapsed(): number { return this.running ? Date.now() - this.start : this.elapsed; }
  isRunning(): boolean { return this.running; }
}
export function measure<T>(fn: () => T): { result: T; time: number } { const start = Date.now(); const result = fn(); return { result, time: Date.now() - start }; }
export async function measureAsync<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> { const start = Date.now(); const result = await fn(); return { result, time: Date.now() - start }; }
