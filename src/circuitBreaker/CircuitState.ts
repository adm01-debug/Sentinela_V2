export enum State { CLOSED = 'CLOSED', OPEN = 'OPEN', HALF_OPEN = 'HALF_OPEN' }
export class CircuitState {
  private state: State = State.CLOSED;
  private failures = 0;
  private lastFailure = 0;
  getState(): State { return this.state; }
  getFailures(): number { return this.failures; }
  getLastFailure(): number { return this.lastFailure; }
  success() { this.failures = 0; this.state = State.CLOSED; }
  failure() { this.failures++; this.lastFailure = Date.now(); }
  open() { this.state = State.OPEN; }
  halfOpen() { this.state = State.HALF_OPEN; }
  close() { this.state = State.CLOSED; this.failures = 0; }
}
