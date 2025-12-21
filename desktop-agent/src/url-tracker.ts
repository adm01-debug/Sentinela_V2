import { EventEmitter } from 'events';

class UrlTracker extends EventEmitter {
  private history: string[] = [];
  track(url: string) { this.history.push(url); this.emit('url', url); }
  getHistory() { return this.history; }
  clear() { this.history = []; }
}

export const urlTracker = new UrlTracker();