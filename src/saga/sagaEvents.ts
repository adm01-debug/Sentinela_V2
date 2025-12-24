// Saga Events - Event-Driven Saga
export interface SagaEvent {
  sagaId: string;
  eventType: string;
  stepName: string;
  timestamp: Date;
  payload?: Record<string, unknown>;
  error?: string;
}

export type SagaEventType = 
  | "SAGA_STARTED"
  | "STEP_STARTED"
  | "STEP_COMPLETED"
  | "STEP_FAILED"
  | "COMPENSATION_STARTED"
  | "COMPENSATION_COMPLETED"
  | "SAGA_COMPLETED"
  | "SAGA_FAILED";

export interface SagaEventHandler {
  (event: SagaEvent): void | Promise<void>;
}

export class SagaEventEmitter {
  private handlers: Map<SagaEventType | "*", SagaEventHandler[]> = new Map();

  on(eventType: SagaEventType | "*", handler: SagaEventHandler): () => void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
    return () => {
      const idx = handlers.indexOf(handler);
      if (idx > -1) handlers.splice(idx, 1);
    };
  }

  async emit(event: SagaEvent): Promise<void> {
    const typeHandlers = this.handlers.get(event.eventType as SagaEventType) || [];
    const wildcardHandlers = this.handlers.get("*") || [];
    const allHandlers = [...typeHandlers, ...wildcardHandlers];
    await Promise.all(allHandlers.map(h => h(event)));
  }

  createEvent(sagaId: string, eventType: SagaEventType, stepName: string, payload?: Record<string, unknown>, error?: string): SagaEvent {
    return { sagaId, eventType, stepName, timestamp: new Date(), payload, error };
  }
}

export class SagaLogger {
  private events: SagaEvent[] = [];

  constructor(private emitter: SagaEventEmitter) {
    emitter.on("*", (event) => this.log(event));
  }

  private log(event: SagaEvent): void {
    this.events.push(event);
    console.log(`[SAGA:${event.sagaId}] ${event.eventType} - ${event.stepName}`, event.payload || "");
  }

  getEvents(sagaId?: string): SagaEvent[] {
    return sagaId ? this.events.filter(e => e.sagaId === sagaId) : this.events;
  }
}
