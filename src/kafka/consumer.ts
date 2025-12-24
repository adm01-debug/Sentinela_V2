// Kafka Consumer
export interface ConsumerConfig { brokers: string[]; groupId: string; topics: string[]; }
export interface ConsumerMessage { topic: string; partition: number; offset: string; key?: string; value: unknown; }
export type MessageHandler = (message: ConsumerMessage) => Promise<void>;
export class KafkaConsumer {
  private running = false; private handlers: Map<string, MessageHandler> = new Map();
  constructor(private config: ConsumerConfig) {}
  async subscribe(topic: string, handler: MessageHandler): Promise<void> { this.handlers.set(topic, handler); }
  async start(): Promise<void> { this.running = true; console.log("[Kafka] Consumer started, group:", this.config.groupId); }
  async stop(): Promise<void> { this.running = false; }
  async commit(message: ConsumerMessage): Promise<void> { console.log("[Kafka] Committed offset", message.offset); }
}
