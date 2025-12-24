import { DatabaseResolver, ResolverContext } from './types';
import { MultiDatabaseManager } from './manager';

export class DatabaseResolverManager {
  private resolvers: DatabaseResolver[] = [];
  
  constructor(private manager: MultiDatabaseManager) {}
  
  addResolver(resolver: DatabaseResolver): void { this.resolvers.push(resolver); }
  
  resolve(context: ResolverContext): string {
    for (const resolver of this.resolvers) {
      const result = resolver(context);
      if (result) return result;
    }
    throw new Error('Could not resolve database');
  }
  
  getConnection(context: ResolverContext) {
    const dbName = this.resolve(context);
    return this.manager.getConnection(dbName);
  }
}

export const Resolvers = {
  byTenant: (mapping: Record<string, string>): DatabaseResolver => (ctx) => ctx.tenantId ? mapping[ctx.tenantId] : '',
  byRegion: (mapping: Record<string, string>): DatabaseResolver => (ctx) => ctx.region ? mapping[ctx.region] : '',
  byOperation: (readDb: string, writeDb: string): DatabaseResolver => (ctx) => ctx.operation === 'read' ? readDb : writeDb,
  fallback: (dbName: string): DatabaseResolver => () => dbName,
};