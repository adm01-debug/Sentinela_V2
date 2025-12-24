// Stream Aggregation
export class StreamAggregator<T, K, V> {
  private state: Map<K, V> = new Map();
  constructor(private keyFn: (item: T) => K, private reducer: (acc: V | undefined, item: T) => V) {}
  add(item: T): void { const key = this.keyFn(item); const current = this.state.get(key); this.state.set(key, this.reducer(current, item)); }
  get(key: K): V | undefined { return this.state.get(key); }
  getAll(): Map<K, V> { return new Map(this.state); }
  reset(): void { this.state.clear(); }
}
