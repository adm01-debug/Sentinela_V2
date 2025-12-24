import { ConnectionInfo } from './types';
import { v4 as uuidv4 } from 'uuid';

export class PooledConnection {
  private info: ConnectionInfo;
  
  constructor() {
    this.info = { id: uuidv4(), createdAt: new Date(), lastUsedAt: new Date(), useCount: 0, isValid: true };
  }
  
  markUsed(): void { this.info.lastUsedAt = new Date(); this.info.useCount++; }
  getInfo(): ConnectionInfo { return { ...this.info }; }
  isValid(): boolean { return this.info.isValid; }
  invalidate(): void { this.info.isValid = false; }
  
  async query<T>(sql: string, params?: unknown[]): Promise<T[]> { return []; }
  async execute(sql: string, params?: unknown[]): Promise<number> { return 0; }
  async close(): Promise<void> { this.info.isValid = false; }
  
  getIdleTime(): number { return Date.now() - this.info.lastUsedAt.getTime(); }
  getAge(): number { return Date.now() - this.info.createdAt.getTime(); }
}