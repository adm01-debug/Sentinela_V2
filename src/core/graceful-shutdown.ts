/**
 * @fileoverview Graceful Shutdown
 * @module @sentinela/core/graceful-shutdown
 */
export type ShutdownHandler = () => Promise<void>;
export class GracefulShutdown {
  private handlers: ShutdownHandler[] = [];
  private shuttingDown = false;
  register(handler: ShutdownHandler): void { this.handlers.push(handler); }
  async shutdown(): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;
    for (const handler of this.handlers.reverse()) {
      try { await handler(); } catch (e) { console.error('Shutdown error:', e); }
    }
  }
  setupSignals(): void {
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }
}
export const shutdown = new GracefulShutdown();
