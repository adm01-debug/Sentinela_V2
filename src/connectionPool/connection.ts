import { Connection } from './types';

export class ManagedConnection implements Connection {
  id: string;
  createdAt: Date;
  lastUsedAt: Date;
  inUse: boolean = false;
  private queries: number = 0;
  
  constructor(id: string) {
    this.id = id;
    this.createdAt = new Date();
    this.lastUsedAt = new Date();
  }
  
  async query<T>(sql: string, params?: unknown[]): Promise<T> {
    this.queries++;
    this.lastUsedAt = new Date();
    console.log('Executing:', sql, params);
    return {} as T;
  }
  
  async beginTransaction(): Promise<void> { console.log('Begin transaction'); }
  async commit(): Promise<void> { console.log('Commit'); }
  async rollback(): Promise<void> { console.log('Rollback'); }
  
  getQueryCount(): number { return this.queries; }
  isStale(maxIdleMs: number): boolean { return Date.now() - this.lastUsedAt.getTime() > maxIdleMs; }
}