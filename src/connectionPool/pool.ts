/**
 * @fileoverview Connection pool
 * @module @sentinela/core/connectionPool
 * @version 13.0.0
 */

import { PoolConfig, Connection, PoolStats } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ConnectionPool {
  private connections: Connection[] = [];
  private waiting: ((conn: Connection) => void)[] = [];
  
  constructor(private config: PoolConfig) {
    for (let i = 0; i < config.minConnections; i++) this.createConnection();
  }
  
  async acquire(): Promise<Connection> {
    const idle = this.connections.find(c => !c.inUse);
    if (idle) { idle.inUse = true; idle.lastUsedAt = new Date(); return idle; }
    
    if (this.connections.length < this.config.maxConnections) {
      const conn = this.createConnection();
      conn.inUse = true;
      return conn;
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waiting.indexOf(resolve);
        if (index >= 0) this.waiting.splice(index, 1);
        reject(new Error('Acquire timeout'));
      }, this.config.acquireTimeout);
      
      this.waiting.push((conn) => { clearTimeout(timeout); resolve(conn); });
    });
  }
  
  release(connection: Connection): void {
    connection.inUse = false;
    connection.lastUsedAt = new Date();
    
    const waiter = this.waiting.shift();
    if (waiter) { connection.inUse = true; waiter(connection); }
  }
  
  private createConnection(): Connection {
    const conn: Connection = { id: uuidv4(), createdAt: new Date(), lastUsedAt: new Date(), inUse: false };
    this.connections.push(conn);
    return conn;
  }
  
  getStats(): PoolStats {
    return {
      total: this.connections.length,
      inUse: this.connections.filter(c => c.inUse).length,
      idle: this.connections.filter(c => !c.inUse).length,
      waiting: this.waiting.length
    };
  }
  
  async destroy(): Promise<void> { this.connections = []; this.waiting = []; }
}