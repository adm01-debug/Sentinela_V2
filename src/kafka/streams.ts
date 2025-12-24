// Kafka Streams
export interface StreamProcessor<T, R> { process(value: T): R | Promise<R>; }
export class KafkaStream<T, R> {
  private processors: StreamProcessor<any, any>[] = [];
  map<U>(fn: (value: T) => U): KafkaStream<U, R> { this.processors.push({ process: fn }); return this as unknown as KafkaStream<U, R>; }
  filter(predicate: (value: T) => boolean): KafkaStream<T, R> { this.processors.push({ process: (v: T) => predicate(v) ? v : null }); return this; }
  async process(input: T): Promise<R> { let value: any = input; for (const proc of this.processors) { value = await proc.process(value); if (value === null) break; } return value; }
}
