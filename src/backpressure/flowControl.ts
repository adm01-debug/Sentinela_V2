// Flow Control
export class FlowController {
  private windowSize: number; private inFlight = 0;
  constructor(initialWindow: number = 10) { this.windowSize = initialWindow; }
  canSend(): boolean { return this.inFlight < this.windowSize; }
  send(): void { this.inFlight++; }
  ack(): void { this.inFlight = Math.max(0, this.inFlight - 1); }
  adjustWindow(delta: number): void { this.windowSize = Math.max(1, this.windowSize + delta); }
  getStats() { return { window: this.windowSize, inFlight: this.inFlight }; }
}
