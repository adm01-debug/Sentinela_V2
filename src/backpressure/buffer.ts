export class RingBuffer<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;
  
  constructor(private capacity: number) { this.buffer = new Array(capacity); }
  
  push(item: T): boolean {
    if (this.count === this.capacity) return false;
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this.count++;
    return true;
  }
  
  pop(): T | undefined {
    if (this.count === 0) return undefined;
    const item = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return item;
  }
  
  peek(): T | undefined { return this.count === 0 ? undefined : this.buffer[this.head]; }
  size(): number { return this.count; }
  isEmpty(): boolean { return this.count === 0; }
  isFull(): boolean { return this.count === this.capacity; }
}