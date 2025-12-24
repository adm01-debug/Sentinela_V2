import { StreamEvent } from './types';

export class StreamOperators {
  static keyBy<T, K>(keyExtractor: (value: T) => K): (event: StreamEvent<T>) => StreamEvent<T> & { key: K } {
    return event => ({ ...event, key: keyExtractor(event.value) });
  }
  
  static reduce<T, R>(initial: R, reducer: (acc: R, value: T) => R): StreamReducer<T, R> {
    return new StreamReducer(initial, reducer);
  }
  
  static aggregate<T, A, R>(
    initializer: () => A,
    aggregator: (acc: A, value: T) => A,
    finisher: (acc: A) => R
  ): StreamAggregator<T, A, R> {
    return new StreamAggregator(initializer, aggregator, finisher);
  }
}

export class StreamReducer<T, R> {
  private accumulator: R;
  constructor(initial: R, private reducer: (acc: R, value: T) => R) { this.accumulator = initial; }
  
  process(value: T): R {
    this.accumulator = this.reducer(this.accumulator, value);
    return this.accumulator;
  }
  
  getResult(): R { return this.accumulator; }
  reset(initial: R): void { this.accumulator = initial; }
}

export class StreamAggregator<T, A, R> {
  private accumulator: A;
  constructor(private initializer: () => A, private aggregator: (acc: A, value: T) => A, private finisher: (acc: A) => R) {
    this.accumulator = initializer();
  }
  
  add(value: T): void { this.accumulator = this.aggregator(this.accumulator, value); }
  getResult(): R { return this.finisher(this.accumulator); }
  reset(): void { this.accumulator = this.initializer(); }
}