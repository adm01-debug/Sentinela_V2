import { EventSubscription } from './types';

export class CompositeSubscription implements EventSubscription {
  private subscriptions: EventSubscription[] = [];
  
  add(sub: EventSubscription): this { this.subscriptions.push(sub); return this; }
  unsubscribe(): void { this.subscriptions.forEach(s => s.unsubscribe()); this.subscriptions = []; }
}

export class AutoUnsubscribe {
  private subscriptions: EventSubscription[] = [];
  
  track(sub: EventSubscription): EventSubscription { this.subscriptions.push(sub); return sub; }
  unsubscribeAll(): void { this.subscriptions.forEach(s => s.unsubscribe()); this.subscriptions = []; }
}