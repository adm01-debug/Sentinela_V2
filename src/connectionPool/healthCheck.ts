import { ConnectionPool } from './pool';
import { PooledConnection } from './connection';

export class PoolHealthCheck {
  private timer?: NodeJS.Timeout;
  
  constructor(private pool: ConnectionPool, private validationQuery: string, private interval: number = 30000) {}
  
  start(): void { this.timer = setInterval(() => this.check(), this.interval); }
  stop(): void { if (this.timer) clearInterval(this.timer); }
  
  private async check(): Promise<void> {
    const stats = this.pool.getStats();
    console.log('Pool health:', stats);
  }
  
  async validateConnection(conn: PooledConnection): Promise<boolean> {
    try { await conn.query(this.validationQuery); return true; }
    catch { conn.invalidate(); return false; }
  }
}

export class ConnectionValidator {
  static async validate(conn: PooledConnection, maxIdleMs: number, maxAgeMs: number): Promise<boolean> {
    if (!conn.isValid()) return false;
    if (conn.getIdleTime() > maxIdleMs) return false;
    if (conn.getAge() > maxAgeMs) return false;
    return true;
  }
}