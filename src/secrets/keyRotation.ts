export interface KeyRotationConfig { intervalMs: number; onRotate: (newKey: string) => Promise<void>; }
export class KeyRotation {
  private timer: NodeJS.Timeout | null = null;
  private currentKey: string = '';
  start(config: KeyRotationConfig): void { this.rotate(config); this.timer = setInterval(() => this.rotate(config), config.intervalMs); }
  stop(): void { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  private async rotate(config: KeyRotationConfig): Promise<void> { this.currentKey = this.generateKey(); await config.onRotate(this.currentKey); }
  private generateKey(): string { return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join(''); }
  getCurrentKey(): string { return this.currentKey; }
}
export const keyRotation = new KeyRotation();
