import { StoredEvent, Projection } from './types';

export class ProjectionEngine {
  private projections: Map<string, ProjectionState> = new Map();
  
  register<S>(projection: Projection<S>): void {
    this.projections.set(projection.name, { projection: projection as Projection, state: projection.initialState, lastPosition: 0 });
  }
  
  async project(event: StoredEvent): Promise<void> {
    for (const [name, ps] of this.projections) {
      const handler = ps.projection.handlers[event.eventType];
      if (handler) {
        ps.state = handler(ps.state, event);
        ps.lastPosition = event.version;
      }
    }
  }
  
  async projectAll(events: StoredEvent[]): Promise<void> {
    for (const event of events) await this.project(event);
  }
  
  getState<S>(projectionName: string): S | undefined {
    return this.projections.get(projectionName)?.state as S;
  }
  
  reset(projectionName: string): void {
    const ps = this.projections.get(projectionName);
    if (ps) { ps.state = ps.projection.initialState; ps.lastPosition = 0; }
  }
}

interface ProjectionState { projection: Projection; state: unknown; lastPosition: number; }