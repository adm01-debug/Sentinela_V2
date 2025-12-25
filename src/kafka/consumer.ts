/**
 * @fileoverview Kafka Consumer implementation
 * @module @sentinela/core/kafka
 * @version 13.0.0
 */

export interface ConsumerConfig {
  brokers: string[];
  groupId: string;
}

export interface ConsumedMessage {
  topic: string;
  partition: number;
  offset: string;
  key?: string;
  value: string;
  timestamp: string;
}

export type MessageHandler = (message: ConsumedMessage) => Promise<void>;

export class KafkaConsumer {
  private subscriptions = new Set<string>();
  private handlers = new Map<string, MessageHandler>();
  private running = false;

  constructor(private config: ConsumerConfig) {}

  async subscribe(topic: string, handler?: MessageHandler): Promise<void> {
    this.subscriptions.add(topic);
    if (handler) this.handlers.set(topic, handler);
  }

  async unsubscribe(topic: string): Promise<void> {
    this.subscriptions.delete(topic);
    this.handlers.delete(topic);
  }

  isSubscribed(topic: string): boolean {
    return this.subscriptions.has(topic);
  }

  async start(): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<void> {
    this.running = false;
  }

  async disconnect(): Promise<void> {
    this.running = false;
    this.subscriptions.clear();
    this.handlers.clear();
  }
}
