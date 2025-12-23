export type EventHandlerFn<T = any> = (event: T) => Promise<void> | void;
export class EventHandler<T = any> {
  private handler: EventHandlerFn<T>;
  private errorHandler?: (error: Error, event: T) => void;
  constructor(handler: EventHandlerFn<T>) { this.handler = handler; }
  setErrorHandler(handler: (error: Error, event: T) => void): void { this.errorHandler = handler; }
  async handle(event: T): Promise<void> { try { await this.handler(event); } catch (error) { if (this.errorHandler) this.errorHandler(error as Error, event); else throw error; } }
}
export function createEventHandler<T>(handler: EventHandlerFn<T>): EventHandler<T> { return new EventHandler(handler); }
