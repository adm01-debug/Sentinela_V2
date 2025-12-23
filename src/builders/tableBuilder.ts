interface TableColumn<T> { key: keyof T; header: string; sortable?: boolean; render?: (value: any, row: T) => any; width?: string; }
export class TableBuilder<T> {
  private columns: TableColumn<T>[] = [];
  column(key: keyof T, header: string, opts?: Partial<TableColumn<T>>) { this.columns.push({ key, header, ...opts }); return this; }
  sortable(key: keyof T, header: string, opts?: Partial<TableColumn<T>>) { this.columns.push({ key, header, sortable: true, ...opts }); return this; }
  custom(key: keyof T, header: string, render: (value: any, row: T) => any, opts?: Partial<TableColumn<T>>) { this.columns.push({ key, header, render, ...opts }); return this; }
  build() { return this.columns; }
}
