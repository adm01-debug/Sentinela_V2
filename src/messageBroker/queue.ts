import { BrokerMessage, SubscribeOptions } from './types';

export class MessageQueue {
  private messages: BrokerMessage[] = [];
  private subscribers: Array<{ handler: (message: BrokerMessage) => Promise<void>; options: SubscribeOptions }> = [];
  
  constructor(public readonly name: string, private maxSize: number) {}
  
  async enqueue(message: BrokerMessage): Promise<boolean> {
    if (this.messages.length >= this.maxSize) return false;
    this.messages.push(message);
    await this.dispatch(message);
    return true;
  }
  
  async dequeue(): Promise<BrokerMessage | null> { return this.messages.shift() ?? null; }
  peek(): BrokerMessage | null { return this.messages[0] ?? null; }
  size(): number { return this.messages.length; }
  
  subscribe(handler: (message: BrokerMessage) => Promise<void>, options: SubscribeOptions = {}): () => void {
    const sub = { handler, options };
    this.subscribers.push(sub);
    return () => { const idx = this.subscribers.indexOf(sub); if (idx > -1) this.subscribers.splice(idx, 1); };
  }
  
  private async dispatch(message: BrokerMessage): Promise<void> {
    for (const sub of this.subscribers) {
      await sub.handler(message);
      if (sub.options.autoAck !== false) this.messages.shift();
    }
  }
  
  purge(): void { this.messages = []; }
}