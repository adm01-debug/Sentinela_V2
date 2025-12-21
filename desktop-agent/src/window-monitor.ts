import { EventEmitter } from 'events';

class WindowMonitor extends EventEmitter {
  private windows: { id: number; title: string; app: string }[] = [];
  add(window: { id: number; title: string; app: string }) { this.windows.push(window); this.emit('window', window); }
  getAll() { return this.windows; }
}

export const windowMonitor = new WindowMonitor();