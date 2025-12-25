/**
 * @fileoverview CDC capturer
 * @module @sentinela/core/cdc
 * @version 13.0.0
 */

import { ChangeEvent, CDCConfig } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ChangeDataCapturer {
  private changes: ChangeEvent[] = [];
  private position: number = 0;
  
  constructor(private config: CDCConfig) {}
  
  capture(table: string, operation: ChangeEvent['operation'], before?: Record<string, unknown>, after?: Record<string, unknown>): ChangeEvent {
    const event: ChangeEvent = {
      id: uuidv4(), source: this.config.source, table, operation, before, after, timestamp: new Date()
    };
    this.changes.push(event);
    return event;
  }
  
  getChanges(fromPosition?: number, limit?: number): ChangeEvent[] {
    const start = fromPosition ?? 0;
    const end = limit ? start + limit : undefined;
    return this.changes.slice(start, end);
  }
  
  acknowledge(upToId: string): void {
    const index = this.changes.findIndex(c => c.id === upToId);
    if (index >= 0) this.position = index + 1;
  }
  
  getPosition(): number { return this.position; }
}