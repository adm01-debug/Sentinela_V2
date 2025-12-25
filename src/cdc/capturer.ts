/**
 * @fileoverview Change Data Capture
 * @module @sentinela/core/cdc
 */
export interface ChangeEvent { table: string; operation: 'INSERT' | 'UPDATE' | 'DELETE'; before?: unknown; after?: unknown; timestamp: number; }
export class CDCCapturer {
  private listeners: Array<(event: ChangeEvent) => void> = [];
  onChange(fn: (event: ChangeEvent) => void): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }
  emit(event: ChangeEvent): void { this.listeners.forEach(fn => fn(event)); }
}
