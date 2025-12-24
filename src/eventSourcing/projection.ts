import { StoredEvent, Projection } from './types';

export class ProjectionManager<S> {
  private state: S;
  private position: number = 0;
  
  constructor(private projection: Projection<S>) { this.state = projection.initialState; }
  
  apply(event: StoredEvent): S {
    const handler = this.projection.handlers[event.eventType];
    if (handler) this.state = handler(this.state, event);
    this.position++;
    return this.state;
  }
  
  applyAll(events: StoredEvent[]): S {
    events.forEach(e => this.apply(e));
    return this.state;
  }
  
  getState(): S { return this.state; }
  getPosition(): number { return this.position; }
  reset(): void { this.state = this.projection.initialState; this.position = 0; }
}

export class LiveProjection<S> {
  private manager: ProjectionManager<S>;
  private unsubscribe?: () => void;
  
  constructor(projection: Projection<S>, private eventStore: { subscribe: (h: (e: StoredEvent) => void) => () => void }) {
    this.manager = new ProjectionManager(projection);
  }
  
  start(): void {
    this.unsubscribe = this.eventStore.subscribe(event => this.manager.apply(event));
  }
  
  stop(): void { this.unsubscribe?.(); }
  getState(): S { return this.manager.getState(); }
}