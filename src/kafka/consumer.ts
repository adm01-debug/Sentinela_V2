import { KafkaConfig, ConsumerMessage } from './types';

export type MessageHandler = (message: ConsumerMessage) => Promise<void>;

export class KafkaConsumer {
  private connected: boolean = false;
  private subscriptions: Map<string, MessageHandler> = new Map();
  
  constructor(private config: KafkaConfig) {}
  
  async connect(): Promise<void> { this.connected = true; console.log('Kafka consumer connected'); }
  async disconnect(): Promise<void> { this.connected = false; this.subscriptions.clear(); }
  
  subscribe(topic: string, handler: MessageHandler): void {
    if (!this.connected) throw new Error('Consumer not connected');
    this.subscriptions.set(topic, handler);
  }
  
  unsubscribe(topic: string): void { this.subscriptions.delete(topic); }
  
  async commitOffset(topic: string, partition: number, offset: string): Promise<void> {
    console.log('Committed offset:', topic, partition, offset);
  }
  
  getSubscriptions(): string[] { return Array.from(this.subscriptions.keys()); }
  isConnected(): boolean { return this.connected; }
}