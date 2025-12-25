/**
 * @fileoverview Query builder
 * @module @sentinela/core/queryBuilder
 * @version 13.0.0
 */

import { QueryOptions, JoinClause, OrderClause, WhereClause } from './types';

export class QueryBuilder {
  private table: string = '';
  private columns: string[] = ['*'];
  private wheres: WhereClause[] = [];
  private joins: JoinClause[] = [];
  private orders: OrderClause[] = [];
  private groups: string[] = [];
  private options: QueryOptions = {};
  
  from(table: string): this { this.table = table; return this; }
  select(...columns: string[]): this { this.columns = columns; return this; }
  
  where(column: string, operator: string, value: unknown): this {
    this.wheres.push({ column, operator, value, logic: 'and' });
    return this;
  }
  
  orWhere(column: string, operator: string, value: unknown): this {
    this.wheres.push({ column, operator, value, logic: 'or' });
    return this;
  }
  
  join(table: string, on: string, type: JoinClause['type'] = 'inner'): this {
    this.joins.push({ type, table, on });
    return this;
  }
  
  orderBy(column: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.orders.push({ column, direction });
    return this;
  }
  
  groupBy(...columns: string[]): this { this.groups.push(...columns); return this; }
  limit(count: number): this { this.options.limit = count; return this; }
  offset(count: number): this { this.options.offset = count; return this; }
  distinct(): this { this.options.distinct = true; return this; }
  
  toSQL(): string {
    let sql = 'SELECT ' + (this.options.distinct ? 'DISTINCT ' : '') + this.columns.join(', ');
    sql += ' FROM ' + this.table;
    this.joins.forEach(j => sql += ' ' + j.type.toUpperCase() + ' JOIN ' + j.table + ' ON ' + j.on);
    if (this.wheres.length) {
      sql += ' WHERE ' + this.wheres.map((w, i) => (i > 0 ? w.logic.toUpperCase() + ' ' : '') + w.column + ' ' + w.operator + ' ?').join(' ');
    }
    if (this.groups.length) sql += ' GROUP BY ' + this.groups.join(', ');
    if (this.orders.length) sql += ' ORDER BY ' + this.orders.map(o => o.column + ' ' + o.direction.toUpperCase()).join(', ');
    if (this.options.limit) sql += ' LIMIT ' + this.options.limit;
    if (this.options.offset) sql += ' OFFSET ' + this.options.offset;
    return sql;
  }
  
  getParams(): unknown[] { return this.wheres.map(w => w.value); }
  
  clone(): QueryBuilder {
    const builder = new QueryBuilder();
    builder.table = this.table;
    builder.columns = [...this.columns];
    builder.wheres = [...this.wheres];
    builder.joins = [...this.joins];
    builder.orders = [...this.orders];
    builder.groups = [...this.groups];
    builder.options = { ...this.options };
    return builder;
  }
}