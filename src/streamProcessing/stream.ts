import { StreamConfig, StreamRecord } from './types';

export class DataStream<T> {
  private operators: Array<(record: StreamRecord<T>) => StreamRecord<T> | null> = [];
  private sinks: Array<(record: StreamRecord<T>) => Promise<void>> = [];
  
  constructor(private config: StreamConfig) {}
  
  map<R>(fn: (value: T) => R): DataStream<R> {
    const newStream = new DataStream<R>(this.config);
    this.operators.push(record => ({ ...record, value: fn(record.value) as unknown as T }));
    return newStream as unknown as DataStream<R>;
  }
  
  filter(predicate: (value: T) => boolean): DataStream<T> {
    this.operators.push(record => predicate(record.value) ? record : null);
    return this;
  }
  
  flatMap<R>(fn: (value: T) => R[]): DataStream<R> {
    const newStream = new DataStream<R>(this.config);
    return newStream;
  }
  
  addSink(sink: (record: StreamRecord<T>) => Promise<void>): void { this.sinks.push(sink); }
  
  async process(record: StreamRecord<T>): Promise<void> {
    let current: StreamRecord<T> | null = record;
    for (const op of this.operators) { current = op(current!); if (!current) return; }
    await Promise.all(this.sinks.map(s => s(current!)));
  }
}

export class StreamBuilder {
  static fromSource<T>(config: StreamConfig): DataStream<T> { return new DataStream<T>(config); }
}