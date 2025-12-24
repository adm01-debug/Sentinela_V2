// Idempotency Handler
import { OutboxMessage } from './types';

export interface IdempotencyStore {
  exists(key: string): Promise<boolean>;
  set(key: string, ttlMs: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private keys: Map<string, number> = new Map();

  async exists(key: string): Promise<boolean> {
    const expiry = this.keys.get(key);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this.keys.delete(key);
      return false;
    }
    return true;
  }

  async set(key: string, ttlMs: number): Promise<void> {
    this.keys.set(key, Date.now() + ttlMs);
  }

  async delete(key: string): Promise<void> {
    this.keys.delete(key);
  }
}

export class IdempotentMessageHandler {
  private store: IdempotencyStore;
  private ttlMs: number;

  constructor(store: IdempotencyStore, ttlMs: number = 24 * 60 * 60 * 1000) {
    this.store = store;
    this.ttlMs = ttlMs;
  }

  async handle<T>(
    message: OutboxMessage,
    handler: (message: OutboxMessage) => Promise<T>
  ): Promise<IdempotencyResult<T>> {
    const key = this.generateKey(message);

    if (await this.store.exists(key)) {
      return {
        processed: false,
        reason: 'duplicate',
        messageId: message.id
      };
    }

    await this.store.set(key, this.ttlMs);

    try {
      const result = await handler(message);
      return {
        processed: true,
        result,
        messageId: message.id
      };
    } catch (error) {
      await this.store.delete(key);
      throw error;
    }
  }

  private generateKey(message: OutboxMessage): string {
    return message.aggregateType + ':' + message.aggregateId + ':' + message.eventType + ':' + message.id;
  }
}

export interface IdempotencyResult<T> {
  processed: boolean;
  reason?: string;
  result?: T;
  messageId: string;
}

export class DeduplicationFilter {
  private processedIds: Set<string> = new Set();
  private maxSize: number;

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize;
  }

  shouldProcess(messageId: string): boolean {
    if (this.processedIds.has(messageId)) {
      return false;
    }

    if (this.processedIds.size >= this.maxSize) {
      const firstId = this.processedIds.values().next().value;
      this.processedIds.delete(firstId);
    }

    this.processedIds.add(messageId);
    return true;
  }

  markProcessed(messageId: string): void {
    if (this.processedIds.size >= this.maxSize) {
      const firstId = this.processedIds.values().next().value;
      this.processedIds.delete(firstId);
    }
    this.processedIds.add(messageId);
  }

  clear(): void {
    this.processedIds.clear();
  }
}

export class OrderedMessageProcessor {
  private expectedSequence: Map<string, number> = new Map();
  private buffer: Map<string, Map<number, OutboxMessage>> = new Map();

  async processInOrder(
    message: OutboxMessage & { sequence: number },
    handler: (message: OutboxMessage) => Promise<void>
  ): Promise<ProcessingStatus> {
    const key = message.aggregateId;
    const expected = this.expectedSequence.get(key) ?? 1;

    if (message.sequence === expected) {
      await handler(message);
      this.expectedSequence.set(key, expected + 1);
      await this.processBuffered(key, handler);
      return ProcessingStatus.Processed;
    }

    if (message.sequence > expected) {
      this.bufferMessage(key, message);
      return ProcessingStatus.Buffered;
    }

    return ProcessingStatus.Duplicate;
  }

  private bufferMessage(key: string, message: OutboxMessage & { sequence: number }): void {
    if (!this.buffer.has(key)) {
      this.buffer.set(key, new Map());
    }
    this.buffer.get(key)!.set(message.sequence, message);
  }

  private async processBuffered(
    key: string,
    handler: (message: OutboxMessage) => Promise<void>
  ): Promise<void> {
    const messageBuffer = this.buffer.get(key);
    if (!messageBuffer) return;

    let expected = this.expectedSequence.get(key) ?? 1;
    
    while (messageBuffer.has(expected)) {
      const message = messageBuffer.get(expected)!;
      messageBuffer.delete(expected);
      await handler(message);
      expected++;
    }

    this.expectedSequence.set(key, expected);
  }
}

export enum ProcessingStatus {
  Processed = 'processed',
  Buffered = 'buffered',
  Duplicate = 'duplicate'
}
