import { Topic, TopicMessage } from './topic';

export class Subscription {
  private offsets: Map<number, number> = new Map();
  private handler?: (msg: TopicMessage) => Promise<void>;
  private running: boolean = false;
  
  constructor(private topic: Topic, private groupId: string) {
    for (let i = 0; i < topic.getPartitionCount(); i++) this.offsets.set(i, 0);
  }
  
  onMessage(handler: (msg: TopicMessage) => Promise<void>): void { this.handler = handler; }
  
  async start(): Promise<void> {
    this.running = true;
    while (this.running) {
      for (let partition = 0; partition < this.topic.getPartitionCount(); partition++) {
        const offset = this.offsets.get(partition) ?? 0;
        const messages = this.topic.consume(partition, offset, 10);
        for (const msg of messages) {
          if (this.handler) await this.handler(msg);
          this.offsets.set(partition, (msg.offset ?? 0) + 1);
        }
      }
      await new Promise(r => setTimeout(r, 100));
    }
  }
  
  stop(): void { this.running = false; }
  getOffsets(): Map<number, number> { return new Map(this.offsets); }
  commit(partition: number, offset: number): void { this.offsets.set(partition, offset); }
}