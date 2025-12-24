// Stream Processing
export interface StreamConfig { name: string; parallelism: number; }
export class DataStream<T> {
  private processors: ((item: T) => T | Promise<T>)[] = [];
  map<R>(fn: (item: T) => R): DataStream<R> { this.processors.push(fn as any); return this as unknown as DataStream<R>; }
  filter(predicate: (item: T) => boolean): DataStream<T> { this.processors.push(item => predicate(item) ? item : null as any); return this; }
  async process(items: T[]): Promise<T[]> {
    const results: T[] = [];
    for (const item of items) {
      let value: any = item;
      for (const proc of this.processors) { value = await proc(value); if (value === null) break; }
      if (value !== null) results.push(value);
    }
    return results;
  }
}
