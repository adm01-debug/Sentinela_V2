export class DropOldestStrategy<T> {
  private buffer: T[] = [];
  constructor(private maxSize: number) {}
  
  add(item: T): void {
    if (this.buffer.length >= this.maxSize) this.buffer.shift();
    this.buffer.push(item);
  }
  get(): T | undefined { return this.buffer.shift(); }
  size(): number { return this.buffer.length; }
}

export class DropNewestStrategy<T> {
  private buffer: T[] = [];
  constructor(private maxSize: number) {}
  
  add(item: T): boolean {
    if (this.buffer.length >= this.maxSize) return false;
    this.buffer.push(item); return true;
  }
  get(): T | undefined { return this.buffer.shift(); }
  size(): number { return this.buffer.length; }
}

export class SlidingWindowStrategy<T> {
  private buffer: T[] = [];
  constructor(private windowSize: number) {}
  
  add(item: T): void {
    this.buffer.push(item);
    while (this.buffer.length > this.windowSize) this.buffer.shift();
  }
  getWindow(): T[] { return [...this.buffer]; }
  size(): number { return this.buffer.length; }
}