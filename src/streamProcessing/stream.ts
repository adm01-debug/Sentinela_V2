import { StreamConfig, StreamEvent } from './types';

export class DataStream<T> {
  private operators: ((event: StreamEvent<T>) => StreamEvent<unknown> | null)[] = [];
  private sinks: ((event: StreamEvent<unknown>) => Promise<void>)[] = [];
  
  constructor(private config: StreamConfig) {}
  
  map<R>(fn: (value: T) => R): DataStream<R> {
    this.operators.push(event => ({ ...event, value: fn(event.value as T) }));
    return this as unknown as DataStream<R>;
  }
  
  filter(predicate: (value: T) => boolean): DataStream<T> {
    this.operators.push(event => predicate(event.value as T) ? event : null);
    return this;
  }
  
  flatMap<R>(fn: (value: T) => R[]): DataStream<R> {
    const results: StreamEvent<R>[] = [];
    this.operators.push(event => {
      fn(event.value as T).forEach(v => results.push({ ...event, value: v }));
      return results.shift() ?? null;
    });
    return this as unknown as DataStream<R>;
  }
  
  addSink(sink: (event: StreamEvent<unknown>) => Promise<void>): this {
    this.sinks.push(sink);
    return this;
  }
  
  async process(event: StreamEvent<T>): Promise<void> {
    let current: StreamEvent<unknown> | null = event;
    for (const op of this.operators) {
      if (!current) return;
      current = op(current as StreamEvent<T>);
    }
    if (current) {
      await Promise.all(this.sinks.map(sink => sink(current!)));
    }
  }
}