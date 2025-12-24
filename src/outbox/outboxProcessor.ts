// Outbox Processor - Message Processing
import { OutboxMessage } from "./outboxMessage";
import { OutboxRepository } from "./outboxRepository";

export interface MessagePublisher {
  publish(message: OutboxMessage): Promise<void>;
}

export interface OutboxProcessorConfig {
  batchSize: number;
  pollIntervalMs: number;
  maxRetries: number;
  retryDelayMs: number;
}

export class OutboxProcessor {
  private running = false;
  private timer?: NodeJS.Timeout;

  constructor(
    private repository: OutboxRepository,
    private publisher: MessagePublisher,
    private config: OutboxProcessorConfig = { batchSize: 100, pollIntervalMs: 1000, maxRetries: 3, retryDelayMs: 5000 }
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.poll();
  }

  stop(): void {
    this.running = false;
    if (this.timer) clearTimeout(this.timer);
  }

  private async poll(): Promise<void> {
    if (!this.running) return;
    try {
      await this.processBatch();
    } catch (error) {
      console.error("[Outbox] Polling error:", error);
    }
    this.timer = setTimeout(() => this.poll(), this.config.pollIntervalMs);
  }

  private async processBatch(): Promise<void> {
    const messages = await this.repository.findPending(this.config.batchSize);
    for (const message of messages) {
      await this.processMessage(message);
    }
  }

  private async processMessage(message: OutboxMessage): Promise<void> {
    const locked = await this.repository.markAsProcessing(message.id);
    if (!locked) return;

    try {
      await this.publisher.publish(message);
      await this.repository.markAsProcessed(message.id);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      await this.repository.markAsFailed(message.id, errorMsg);
      
      if (message.retryCount >= this.config.maxRetries) {
        await this.repository.moveToDeadLetter(message.id);
      }
    }
  }
}
