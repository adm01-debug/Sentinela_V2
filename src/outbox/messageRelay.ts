// Message Relay Service
import { OutboxMessage, MessagePublisher, PublishResult } from './types';

export class MessageRelay implements MessagePublisher {
  private publishers: Map<string, TargetPublisher> = new Map();
  private defaultPublisher?: TargetPublisher;

  registerPublisher(destination: string, publisher: TargetPublisher): void {
    this.publishers.set(destination, publisher);
  }

  setDefaultPublisher(publisher: TargetPublisher): void {
    this.defaultPublisher = publisher;
  }

  async publish(message: OutboxMessage): Promise<void> {
    const publisher = this.getPublisher(message);
    await publisher.send(message);
  }

  async publishBatch(messages: OutboxMessage[]): Promise<PublishResult[]> {
    const results: PublishResult[] = [];

    for (const message of messages) {
      try {
        await this.publish(message);
        results.push({ messageId: message.id, success: true });
      } catch (error) {
        results.push({
          messageId: message.id,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }

  private getPublisher(message: OutboxMessage): TargetPublisher {
    const destination = message.metadata.destination;
    
    if (destination && this.publishers.has(destination)) {
      return this.publishers.get(destination)!;
    }

    if (this.defaultPublisher) {
      return this.defaultPublisher;
    }

    throw new Error('No publisher configured for destination: ' + (destination ?? 'default'));
  }
}

export interface TargetPublisher {
  send(message: OutboxMessage): Promise<void>;
}

export class HttpPublisher implements TargetPublisher {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.headers = headers;
  }

  async send(message: OutboxMessage): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': message.metadata.correlationId,
        'X-Event-Type': message.eventType,
        ...this.headers,
        ...message.metadata.headers
      },
      body: JSON.stringify({
        id: message.id,
        aggregateId: message.aggregateId,
        aggregateType: message.aggregateType,
        eventType: message.eventType,
        payload: message.payload,
        timestamp: message.createdAt
      })
    });

    if (!response.ok) {
      throw new Error('HTTP error: ' + response.status);
    }
  }
}

export class ConsolePublisher implements TargetPublisher {
  async send(message: OutboxMessage): Promise<void> {
    console.log('[OUTBOX] Publishing message:', {
      id: message.id,
      eventType: message.eventType,
      aggregateId: message.aggregateId
    });
  }
}

export class BatchingPublisher implements TargetPublisher {
  private publisher: TargetPublisher;
  private buffer: OutboxMessage[] = [];
  private batchSize: number;
  private flushIntervalMs: number;
  private timer?: NodeJS.Timeout;

  constructor(publisher: TargetPublisher, batchSize: number = 10, flushIntervalMs: number = 1000) {
    this.publisher = publisher;
    this.batchSize = batchSize;
    this.flushIntervalMs = flushIntervalMs;
    this.startTimer();
  }

  async send(message: OutboxMessage): Promise<void> {
    this.buffer.push(message);
    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  private startTimer(): void {
    this.timer = setInterval(() => this.flush(), this.flushIntervalMs);
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    
    const batch = this.buffer.splice(0, this.batchSize);
    for (const message of batch) {
      await this.publisher.send(message);
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
