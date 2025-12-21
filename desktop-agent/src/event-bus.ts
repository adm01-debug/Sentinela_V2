import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
  publish(event: string, data: any) { this.emit(event, data); }
  subscribe(event: string, handler: (data: any) => void) { this.on(event, handler); }
  unsubscribe(event: string, handler: (data: any) => void) { this.off(event, handler); }
}

export const eventBus = new EventBus();