import { StreamEvent, StreamConfig } from './types';

export class Stream<T> {
  private processors: ((event: StreamEvent<T>) => StreamEvent<unknown> | null)[] = [];
  private sinks: ((event: StreamEvent<unknown>) => Promise<void>)[] = [];
  
  constructor(private config: StreamConfig) {}
  
  map<U>(fn: (value: T) => U): Stream<U> {
    this.processors.push(e => e ? { ...e, value: fn(e.value) } : null);
    return this as unknown as Stream<U>;
  }
  
  filter(predicate: (value: T) => boolean): Stream<T> {
    this.processors.push(e => predicate(e.value) ? e : null);
    return this;
  }
  
  flatMap<U>(fn: (value: T) => U[]): Stream<U> {
    this.processors.push(e => {
      const results = fn(e.value);
      return results.length > 0 ? { ...e, value: results[0] } : null;
    });
    return this as unknown as Stream<U>;
  }
  
  sink(handler: (event: StreamEvent<unknown>) => Promise<void>): void {
    this.sinks.push(handler);
  }
  
  async process(event: StreamEvent<T>): Promise<void> {
    let current: StreamEvent<unknown> | null = event;
    for (const processor of this.processors) {
      if (!current) return;
      current = processor(current as StreamEvent<T>);
    }
    if (current) await Promise.all(this.sinks.map(s => s(current!)));
  }
}