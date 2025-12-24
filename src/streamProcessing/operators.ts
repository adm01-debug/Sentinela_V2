import { StreamEvent } from './types';

export class StreamOperators {
  static keyBy<T, K>(fn: (value: T) => K): (event: StreamEvent<T>) => StreamEvent<T> & { key: K } {
    return event => ({ ...event, key: fn(event.value) });
  }
  
  static groupBy<T, K>(fn: (value: T) => K): GroupedStream<T, K> {
    return new GroupedStream(fn);
  }
  
  static reduce<T, U>(initial: U, fn: (acc: U, value: T) => U): Reducer<T, U> {
    return new Reducer(initial, fn);
  }
  
  static distinct<T>(keyFn?: (value: T) => unknown): DistinctOperator<T> {
    return new DistinctOperator(keyFn);
  }
}

export class GroupedStream<T, K> {
  private groups: Map<K, T[]> = new Map();
  constructor(private keyFn: (value: T) => K) {}
  
  add(value: T): void {
    const key = this.keyFn(value);
    const group = this.groups.get(key) ?? [];
    group.push(value);
    this.groups.set(key, group);
  }
  
  getGroups(): Map<K, T[]> { return new Map(this.groups); }
}

export class Reducer<T, U> {
  private state: U;
  constructor(initial: U, private fn: (acc: U, value: T) => U) { this.state = initial; }
  add(value: T): U { this.state = this.fn(this.state, value); return this.state; }
  getState(): U { return this.state; }
  reset(initial: U): void { this.state = initial; }
}

export class DistinctOperator<T> {
  private seen: Set<unknown> = new Set();
  constructor(private keyFn?: (value: T) => unknown) {}
  
  process(value: T): T | null {
    const key = this.keyFn ? this.keyFn(value) : value;
    if (this.seen.has(key)) return null;
    this.seen.add(key);
    return value;
  }
}