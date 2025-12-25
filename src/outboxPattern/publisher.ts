/**
 * @fileoverview Message publisher
 * @module @sentinela/core/outboxPattern
 * @version 13.0.0
 */

import { OutboxMessage } from './types';

export interface MessagePublisher {
  publish(message: OutboxMessage): Promise<void>;
}

export class KafkaPublisher implements MessagePublisher {
  constructor(private topic: string) {}

  async publish(message: OutboxMessage): Promise<void> {
    console.log('Publishing to Kafka topic', this.topic, ':', message.eventType);
  }
}

export class RabbitMQPublisher implements MessagePublisher {
  constructor(private exchange: string) {}

  async publish(message: OutboxMessage): Promise<void> {
    console.log('Publishing to RabbitMQ exchange', this.exchange, ':', message.eventType);
  }
}

export class CompositePublisher implements MessagePublisher {
  private publishers: MessagePublisher[] = [];

  add(publisher: MessagePublisher): void {
    this.publishers.push(publisher);
  }

  async publish(message: OutboxMessage): Promise<void> {
    await Promise.all(this.publishers.map(p => p.publish(message)));
  }
}

export class RetryablePublisher implements MessagePublisher {
  constructor(
    private delegate: MessagePublisher,
    private maxRetries: number = 3,
    private delayMs: number = 1000
  ) {}

  async publish(message: OutboxMessage): Promise<void> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        await this.delegate.publish(message);
        return;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, this.delayMs * Math.pow(2, attempt)));
        }
      }
    }
    
    throw lastError;
  }
}