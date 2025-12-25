/**
 * @fileoverview Connection Pool implementation
 * @module @sentinela/core/connectionPool
 * @version 13.0.0
 */

export interface PoolConfig {
  minSize: number;
  maxSize: number;
  acquireTimeout?: number;
  idleTimeout?: number;
}

export interface PooledConnection {
  id: string;
  createdAt: Date;
  lastUsedAt: Date;
}

export class ConnectionPool {
  private pool: PooledConnection[] = [];
  private inUse = new Set<string>();
  private idCounter = 0;
  private draining = false;

  constructor(private config: PoolConfig) {
    this.initialize();
  }

  private initialize(): void {
    for (let i = 0; i < this.config.minSize; i++) {
      this.createConnection();
    }
  }

  private createConnection(): PooledConnection {
    const conn: PooledConnection = {
      id: String(++this.idCounter),
      createdAt: new Date(),
      lastUsedAt: new Date()
    };
    this.pool.push(conn);
    return conn;
  }

  async acquire(): Promise<PooledConnection> {
    if (this.draining) throw new Error('Pool is draining');

    const available = this.pool.find(c => !this.inUse.has(c.id));
    if (available) {
      this.inUse.add(available.id);
      available.lastUsedAt = new Date();
      return available;
    }

    if (this.pool.length < this.config.maxSize) {
      const conn = this.createConnection();
      this.inUse.add(conn.id);
      return conn;
    }

    throw new Error('Pool exhausted');
  }

  async release(conn: PooledConnection): Promise<void> {
    this.inUse.delete(conn.id);
    conn.lastUsedAt = new Date();
  }

  async drain(): Promise<void> {
    this.draining = true;
    this.pool = [];
    this.inUse.clear();
  }

  size(): number { return this.pool.length; }
  available(): number { return this.pool.length - this.inUse.size; }
  inUseCount(): number { return this.inUse.size; }
}
