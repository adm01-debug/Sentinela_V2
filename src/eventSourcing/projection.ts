import { StoredEvent, Projection } from './types';
import { EventStore } from './eventStore';

export class ProjectionManager {
  private projections: Map<string, Projection> = new Map();
  private positions: Map<string, number> = new Map();
  
  register(projection: Projection): void { this.projections.set(projection.name, projection); this.positions.set(projection.name, 0); }
  
  async run(eventStore: EventStore): Promise<void> {
    for (const [name, projection] of this.projections) {
      const position = this.positions.get(name) ?? 0;
      const events = await eventStore.getAllEvents(position);
      for (const event of events) { await projection.handle(event); this.positions.set(name, event.version); }
    }
  }
  
  async reset(projectionName: string): Promise<void> {
    const projection = this.projections.get(projectionName);
    if (projection) { await projection.reset(); this.positions.set(projectionName, 0); }
  }
  
  getPosition(projectionName: string): number { return this.positions.get(projectionName) ?? 0; }
}

export abstract class BaseProjection implements Projection {
  abstract name: string;
  protected handlers: Map<string, (event: StoredEvent) => Promise<void>> = new Map();
  
  async handle(event: StoredEvent): Promise<void> {
    const handler = this.handlers.get(event.eventType);
    if (handler) await handler(event);
  }
  
  protected on(eventType: string, handler: (event: StoredEvent) => Promise<void>): void {
    this.handlers.set(eventType, handler);
  }
  
  abstract reset(): Promise<void>;
}