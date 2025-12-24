export class SchemaBuilder {
  private operations: string[] = [];
  
  createTable(name: string, callback: (table: TableBuilder) => void): this {
    const table = new TableBuilder(name);
    callback(table);
    this.operations.push(table.toSQL());
    return this;
  }
  
  dropTable(name: string): this { this.operations.push('DROP TABLE IF EXISTS ' + name); return this; }
  renameTable(from: string, to: string): this { this.operations.push('ALTER TABLE ' + from + ' RENAME TO ' + to); return this; }
  
  toSQL(): string[] { return this.operations; }
}

export class TableBuilder {
  private columns: string[] = [];
  
  constructor(private name: string) {}
  
  id(): this { this.columns.push('id SERIAL PRIMARY KEY'); return this; }
  string(name: string, length: number = 255): this { this.columns.push(name + ' VARCHAR(' + length + ')'); return this; }
  text(name: string): this { this.columns.push(name + ' TEXT'); return this; }
  integer(name: string): this { this.columns.push(name + ' INTEGER'); return this; }
  bigint(name: string): this { this.columns.push(name + ' BIGINT'); return this; }
  boolean(name: string): this { this.columns.push(name + ' BOOLEAN'); return this; }
  timestamp(name: string): this { this.columns.push(name + ' TIMESTAMP'); return this; }
  timestamps(): this { this.columns.push('created_at TIMESTAMP DEFAULT NOW()', 'updated_at TIMESTAMP DEFAULT NOW()'); return this; }
  
  nullable(): this { this.columns[this.columns.length - 1] += ' NULL'; return this; }
  notNull(): this { this.columns[this.columns.length - 1] += ' NOT NULL'; return this; }
  default(value: string): this { this.columns[this.columns.length - 1] += ' DEFAULT ' + value; return this; }
  unique(): this { this.columns[this.columns.length - 1] += ' UNIQUE'; return this; }
  
  toSQL(): string { return 'CREATE TABLE ' + this.name + ' (' + this.columns.join(', ') + ')'; }
}