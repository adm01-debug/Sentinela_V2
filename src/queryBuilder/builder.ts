/**
 * @fileoverview Query Builder
 * @module @sentinela/core/queryBuilder
 */
export class QueryBuilder {
  private parts: { select?: string[]; from?: string; where?: string[]; orderBy?: string; limit?: number } = {};
  select(...fields: string[]): this { this.parts.select = fields; return this; }
  from(table: string): this { this.parts.from = table; return this; }
  where(condition: string): this { (this.parts.where ??= []).push(condition); return this; }
  orderBy(field: string): this { this.parts.orderBy = field; return this; }
  limit(n: number): this { this.parts.limit = n; return this; }
  build(): string {
    let sql = 'SELECT ' + (this.parts.select?.join(', ') ?? '*');
    if (this.parts.from) sql += ' FROM ' + this.parts.from;
    if (this.parts.where?.length) sql += ' WHERE ' + this.parts.where.join(' AND ');
    if (this.parts.orderBy) sql += ' ORDER BY ' + this.parts.orderBy;
    if (this.parts.limit) sql += ' LIMIT ' + this.parts.limit;
    return sql;
  }
}
