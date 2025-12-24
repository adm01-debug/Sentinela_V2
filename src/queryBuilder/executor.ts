import { QueryBuilder } from './builder';

export class QueryExecutor {
  constructor(private connection: DatabaseConnection) {}
  
  async execute<T>(builder: QueryBuilder): Promise<T[]> {
    const sql = builder.toSQL();
    const params = builder.getParams();
    return this.connection.query<T>(sql, params);
  }
  
  async first<T>(builder: QueryBuilder): Promise<T | null> {
    const results = await this.execute<T>(builder.limit(1));
    return results[0] ?? null;
  }
  
  async count(builder: QueryBuilder): Promise<number> {
    const sql = builder.toSQL().replace(/SELECT .+ FROM/, 'SELECT COUNT(*) as count FROM');
    const results = await this.connection.query<{ count: number }>(sql, builder.getParams());
    return results[0]?.count ?? 0;
  }
  
  async paginate<T>(builder: QueryBuilder, page: number, perPage: number): Promise<PaginatedResult<T>> {
    const total = await this.count(builder.clone());
    const items = await this.execute<T>(builder.limit(perPage).offset((page - 1) * perPage));
    return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) };
  }
}

export interface DatabaseConnection { query<T>(sql: string, params: unknown[]): Promise<T[]>; }
export interface PaginatedResult<T> { items: T[]; total: number; page: number; perPage: number; totalPages: number; }