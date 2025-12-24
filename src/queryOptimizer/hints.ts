export class QueryHints {
  private hints: Map<string, string> = new Map();
  
  forceIndex(indexName: string): this { this.hints.set('FORCE INDEX', indexName); return this; }
  useIndex(indexName: string): this { this.hints.set('USE INDEX', indexName); return this; }
  ignoreIndex(indexName: string): this { this.hints.set('IGNORE INDEX', indexName); return this; }
  noCache(): this { this.hints.set('SQL_NO_CACHE', ''); return this; }
  straightJoin(): this { this.hints.set('STRAIGHT_JOIN', ''); return this; }
  
  apply(query: string): string {
    let result = query;
    this.hints.forEach((value, key) => {
      if (value) result = result.replace(/FROM/i, key + '(' + value + ') FROM');
      else result = result.replace(/SELECT/i, 'SELECT ' + key);
    });
    return result;
  }
  
  toString(): string {
    return Array.from(this.hints.entries()).map(([k, v]) => v ? k + '(' + v + ')' : k).join(' ');
  }
}

export class HintBuilder {
  static forQuery(query: string): QueryHints { return new QueryHints(); }
}