export class Schema {
  static create(table: string, callback: (table: TableBuilder) => void): SchemaBuilder {
    const builder = new TableBuilder(table);
    callback(builder);
    return new SchemaBuilder('create', table, builder);
  }
  
  static table(table: string, callback: (table: TableBuilder) => void): SchemaBuilder {
    const builder = new TableBuilder(table);
    callback(builder);
    return new SchemaBuilder('alter', table, builder);
  }
  
  static drop(table: string): SchemaBuilder { return new SchemaBuilder('drop', table); }
  static dropIfExists(table: string): SchemaBuilder { return new SchemaBuilder('dropIfExists', table); }
}

export class TableBuilder {
  private columns: ColumnBuilder[] = [];
  
  constructor(public readonly name: string) {}
  
  id(): ColumnBuilder { return this.bigInteger('id').primary().autoIncrement(); }
  string(name: string, length: number = 255): ColumnBuilder { return this.addColumn(name, 'VARCHAR(' + length + ')'); }
  text(name: string): ColumnBuilder { return this.addColumn(name, 'TEXT'); }
  integer(name: string): ColumnBuilder { return this.addColumn(name, 'INTEGER'); }
  bigInteger(name: string): ColumnBuilder { return this.addColumn(name, 'BIGINT'); }
  decimal(name: string, precision: number = 10, scale: number = 2): ColumnBuilder { return this.addColumn(name, 'DECIMAL(' + precision + ',' + scale + ')'); }
  boolean(name: string): ColumnBuilder { return this.addColumn(name, 'BOOLEAN'); }
  date(name: string): ColumnBuilder { return this.addColumn(name, 'DATE'); }
  datetime(name: string): ColumnBuilder { return this.addColumn(name, 'DATETIME'); }
  timestamp(name: string): ColumnBuilder { return this.addColumn(name, 'TIMESTAMP'); }
  timestamps(): void { this.timestamp('created_at'); this.timestamp('updated_at'); }
  json(name: string): ColumnBuilder { return this.addColumn(name, 'JSON'); }
  
  private addColumn(name: string, type: string): ColumnBuilder {
    const col = new ColumnBuilder(name, type);
    this.columns.push(col);
    return col;
  }
  
  getColumns(): ColumnBuilder[] { return this.columns; }
}

export class ColumnBuilder {
  private nullable_: boolean = true;
  private default_?: string;
  private primary_: boolean = false;
  private unique_: boolean = false;
  private autoIncrement_: boolean = false;
  
  constructor(public readonly name: string, public readonly type: string) {}
  
  nullable(): this { this.nullable_ = true; return this; }
  notNullable(): this { this.nullable_ = false; return this; }
  default(value: string): this { this.default_ = value; return this; }
  primary(): this { this.primary_ = true; return this; }
  unique(): this { this.unique_ = true; return this; }
  autoIncrement(): this { this.autoIncrement_ = true; return this; }
  
  toSQL(): string {
    let sql = this.name + ' ' + this.type;
    if (!this.nullable_) sql += ' NOT NULL';
    if (this.default_) sql += ' DEFAULT ' + this.default_;
    if (this.primary_) sql += ' PRIMARY KEY';
    if (this.unique_) sql += ' UNIQUE';
    if (this.autoIncrement_) sql += ' AUTO_INCREMENT';
    return sql;
  }
}

export class SchemaBuilder {
  constructor(private operation: string, private table: string, private builder?: TableBuilder) {}
  toSQL(): string {
    if (this.operation === 'create' && this.builder) {
      return 'CREATE TABLE ' + this.table + ' (' + this.builder.getColumns().map(c => c.toSQL()).join(', ') + ')';
    }
    if (this.operation === 'drop') return 'DROP TABLE ' + this.table;
    if (this.operation === 'dropIfExists') return 'DROP TABLE IF EXISTS ' + this.table;
    return '';
  }
}