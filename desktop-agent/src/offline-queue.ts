class OfflineQueue<T> {
  private queue: T[] = [];
  enqueue(item: T) { this.queue.push(item); }
  dequeue(): T | undefined { return this.queue.shift(); }
  getAll(): T[] { return [...this.queue]; }
  clear() { this.queue = []; }
  get length() { return this.queue.length; }
}

export const offlineQueue = new OfflineQueue();