import { pubsubManager } from './pubsubManager';
export class Publisher {
  private topic: string;
  constructor(topic: string) { this.topic = topic; }
  publish(data: any): void { pubsubManager.publish(this.topic, data); }
  getTopic(): string { return this.topic; }
}
export function createPublisher(topic: string): Publisher { return new Publisher(topic); }
