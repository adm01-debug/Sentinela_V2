// Event Projection
import { StoredEvent } from "./eventStore";
export abstract class Projection<TState> {
  protected state: TState;
  constructor(initialState: TState) { this.state = initialState; }
  abstract apply(event: StoredEvent): void;
  getState(): TState { return this.state; }
  rebuild(events: StoredEvent[]): void { for (const event of events) this.apply(event); }
}
export class ProjectionManager {
  private projections: Map<string, Projection<unknown>> = new Map();
  register(name: string, projection: Projection<unknown>): void { this.projections.set(name, projection); }
  async rebuild(events: StoredEvent[]): Promise<void> { for (const proj of this.projections.values()) proj.rebuild(events); }
  get<T>(name: string): T | undefined { return this.projections.get(name)?.getState() as T; }
}
