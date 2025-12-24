import { PoolConfig, PoolStats, ConnectionInfo } from './types';
import { PooledConnection } from './connection';
import { v4 as uuidv4 } from 'uuid';

export class ConnectionPool {
  private idle: PooledConnection[] = [];
  private active: Set<PooledConnection> = new Set();
  private waiting: Array<{ resolve: (conn: PooledConnection) => void; reject: (err: Error) => void; timeout: NodeJS.Timeout }> = [];
  private stats: PoolStats = { totalConnections: 0, activeConnections: 0, idleConnections: 0, waitingRequests: 0, acquiredCount: 0, releasedCount: 0 };
  
  constructor(private config: PoolConfig, private factory: () => Promise<PooledConnection>) {}
  
  async initialize(): Promise<void> {
    for (let i = 0; i < this.config.minConnections; i++) {
      const conn = await this.createConnection();
      this.idle.push(conn);
    }
    this.updateStats();
  }
  
  async acquire(): Promise<PooledConnection> {
    if (this.idle.length > 0) {
      const conn = this.idle.pop()!;
      this.active.add(conn);
      conn.markUsed();
      this.stats.acquiredCount++;
      this.updateStats();
      return conn;
    }
    if (this.stats.totalConnections < this.config.maxConnections) {
      const conn = await this.createConnection();
      this.active.add(conn);
      conn.markUsed();
      this.stats.acquiredCount++;
      this.updateStats();
      return conn;
    }
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { reject(new Error('Acquire timeout')); }, this.config.acquireTimeout);
      this.waiting.push({ resolve, reject, timeout });
      this.stats.waitingRequests++;
    });
  }
  
  release(conn: PooledConnection): void {
    this.active.delete(conn);
    if (this.waiting.length > 0) {
      const waiter = this.waiting.shift()!;
      clearTimeout(waiter.timeout);
      this.active.add(conn);
      conn.markUsed();
      waiter.resolve(conn);
    } else {
      this.idle.push(conn);
    }
    this.stats.releasedCount++;
    this.updateStats();
  }
  
  private async createConnection(): Promise<PooledConnection> {
    const conn = await this.factory();
    this.stats.totalConnections++;
    return conn;
  }
  
  private updateStats(): void {
    this.stats.activeConnections = this.active.size;
    this.stats.idleConnections = this.idle.length;
    this.stats.waitingRequests = this.waiting.length;
  }
  
  getStats(): PoolStats { return { ...this.stats }; }
  
  async close(): Promise<void> {
    for (const conn of [...this.idle, ...this.active]) await conn.close();
    this.idle = []; this.active.clear();
  }
}