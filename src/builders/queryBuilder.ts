export class QueryBuilder<T = any> {
  private params: URLSearchParams = new URLSearchParams();
  where(key: string, value: any) { if (value !== undefined && value !== null) this.params.set(key, String(value)); return this; }
  whereIn(key: string, values: any[]) { if (values.length) this.params.set(key, values.join(',')); return this; }
  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') { this.params.set('orderBy', field); this.params.set('order', direction); return this; }
  limit(n: number) { this.params.set('limit', String(n)); return this; }
  offset(n: number) { this.params.set('offset', String(n)); return this; }
  page(n: number, size = 10) { return this.limit(size).offset((n - 1) * size); }
  search(query: string) { if (query) this.params.set('q', query); return this; }
  build() { return this.params.toString(); }
  toUrl(base: string) { const q = this.build(); return q ? base + '?' + q : base; }
}
