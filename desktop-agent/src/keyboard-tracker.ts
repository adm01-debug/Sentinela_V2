import { EventEmitter } from 'events';

class KeyboardTracker extends EventEmitter {
  private keyCount = 0;
  increment() { this.keyCount++; this.emit('keypress', this.keyCount); }
  getCount() { return this.keyCount; }
  reset() { this.keyCount = 0; }
}

export const keyboardTracker = new KeyboardTracker();