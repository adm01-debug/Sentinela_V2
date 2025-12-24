import { StreamRecord } from './types';

export class KeyBy<T, K> {
  constructor(private keyExtractor: (value: T) => K) {}
  apply(record: StreamRecord<T>): StreamRecord<T> & { extractedKey: K } {
    return { ...record, extractedKey: this.keyExtractor(record.value) };
  }
}

export class Reduce<T> {
  private state: Map<string, T> = new Map();
  constructor(private reducer: (acc: T, value: T) => T) {}
  
  apply(record: StreamRecord<T>): StreamRecord<T> {
    const current = this.state.get(record.key);
    const newValue = current ? this.reducer(current, record.value) : record.value;
    this.state.set(record.key, newValue);
    return { ...record, value: newValue };
  }
}

export class Aggregate<T, A> {
  private state: Map<string, A> = new Map();
  constructor(private initializer: () => A, private aggregator: (acc: A, value: T) => A) {}
  
  apply(record: StreamRecord<T>): StreamRecord<A> {
    const current = this.state.get(record.key) ?? this.initializer();
    const newValue = this.aggregator(current, record.value);
    this.state.set(record.key, newValue);
    return { ...record, value: newValue };
  }
}

export class Join<L, R, O> {
  private leftState: Map<string, L[]> = new Map();
  private rightState: Map<string, R[]> = new Map();
  
  constructor(private joiner: (left: L, right: R) => O) {}
  
  addLeft(record: StreamRecord<L>): StreamRecord<O>[] {
    const lefts = this.leftState.get(record.key) ?? [];
    lefts.push(record.value);
    this.leftState.set(record.key, lefts);
    const rights = this.rightState.get(record.key) ?? [];
    return rights.map(r => ({ ...record, value: this.joiner(record.value, r) }));
  }
  
  addRight(record: StreamRecord<R>): StreamRecord<O>[] {
    const rights = this.rightState.get(record.key) ?? [];
    rights.push(record.value);
    this.rightState.set(record.key, rights);
    const lefts = this.leftState.get(record.key) ?? [];
    return lefts.map(l => ({ ...record, value: this.joiner(l, record.value) }));
  }
}