import { pubsubManager } from './pubsubManager';
export class Subscriber {
  private topic: string;
  private unsubscribe: (() => void) | null = null;
  constructor(topic: string) { this.topic = topic; }
  subscribe(callback: (data: any) => void): void { this.unsubscribe = pubsubManager.subscribe(this.topic, callback); }
  cancel(): void { if (this.unsubscribe) { this.unsubscribe(); this.unsubscribe = null; } }
  getTopic(): string { return this.topic; }
  isActive(): boolean { return this.unsubscribe !== null; }
}
export function createSubscriber(topic: string): Subscriber { return new Subscriber(topic); }
