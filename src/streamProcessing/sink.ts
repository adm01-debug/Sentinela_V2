// Stream Sink
export interface Sink<T> { write(item: T): Promise<void>; flush(): Promise<void>; close(): Promise<void>; }
export class ConsoleSink<T> implements Sink<T> {
  async write(item: T): Promise<void> { console.log("[Sink]", item); }
  async flush(): Promise<void> {}
  async close(): Promise<void> {}
}
export class BatchSink<T> implements Sink<T> {
  private buffer: T[] = [];
  constructor(private batchSize: number, private handler: (batch: T[]) => Promise<void>) {}
  async write(item: T): Promise<void> { this.buffer.push(item); if (this.buffer.length >= this.batchSize) await this.flush(); }
  async flush(): Promise<void> { if (this.buffer.length > 0) { await this.handler([...this.buffer]); this.buffer = []; } }
  async close(): Promise<void> { await this.flush(); }
}
