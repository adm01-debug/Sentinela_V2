import { DatabaseConfig } from './types';
import { MultiDatabaseManager } from './manager';

export class QueryRouter {
  constructor(private manager: MultiDatabaseManager) {}
  
  async route<T>(query: string): Promise<{ connection: string; result: T[] }> {
    const connection = this.selectConnection(query);
    const result = await this.manager.query<T>(connection, query);
    return { connection, result };
  }
  
  private selectConnection(query: string): string {
    if (query.toLowerCase().includes('analytics')) return 'analytics';
    if (query.toLowerCase().includes('archive')) return 'archive';
    return 'default';
  }
}

export class ReadWriteSplitter {
  constructor(private writeConnection: string, private readConnections: string[]) {}
  private index: number = 0;
  
  getWriteConnection(): string { return this.writeConnection; }
  
  getReadConnection(): string {
    const conn = this.readConnections[this.index % this.readConnections.length];
    this.index++;
    return conn;
  }
  
  routeQuery(query: string): string {
    const isWrite = /^(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i.test(query.trim());
    return isWrite ? this.getWriteConnection() : this.getReadConnection();
  }
}