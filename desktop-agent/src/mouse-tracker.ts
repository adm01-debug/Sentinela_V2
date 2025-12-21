import { EventEmitter } from 'events';

class MouseTracker extends EventEmitter {
  private clickCount = 0;
  click() { this.clickCount++; this.emit('click', this.clickCount); }
  getCount() { return this.clickCount; }
  reset() { this.clickCount = 0; }
}

export const mouseTracker = new MouseTracker();