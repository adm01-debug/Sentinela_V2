import { EventEmitter } from 'events';

class BackgroundSync extends EventEmitter {
  private queue: any[] = [];
  enqueue(data: any) { this.queue.push(data); }
  async sync() { while (this.queue.length) { const item = this.queue.shift(); this.emit('sync', item); } }
}

export const backgroundSync = new BackgroundSync();