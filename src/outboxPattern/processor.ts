import { Outbox } from './outbox';
import { MessagePublisher } from './publisher';
import { OutboxMessage } from './types';

export class OutboxProcessor {
  private running: boolean = false;
  private intervalId?: NodeJS.Timeout;

  constructor(
    private outbox: Outbox,
    private publisher: MessagePublisher,
    private intervalMs: number = 1000
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.intervalId = setInterval(() => this.process(), this.intervalMs);
  }

  stop(): void {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  async process(): Promise<ProcessResult> {
    const messages = await this.outbox.getPending();
    let published = 0;
    let failed = 0;

    for (const message of messages) {
      try {
        await this.outbox.markProcessing(message.id);
        await this.publisher.publish(message);
        await this.outbox.markPublished(message.id);
        published++;
      } catch (error) {
        await this.outbox.markFailed(message.id, (error as Error).message);
        failed++;
      }
    }

    return { processed: messages.length, published, failed };
  }

  async processOne(messageId: string): Promise<boolean> {
    const messages = await this.outbox.getPending();
    const message = messages.find(m => m.id === messageId);
    if (!message) return false;

    try {
      await this.outbox.markProcessing(message.id);
      await this.publisher.publish(message);
      await this.outbox.markPublished(message.id);
      return true;
    } catch (error) {
      await this.outbox.markFailed(message.id, (error as Error).message);
      return false;
    }
  }
}

export interface ProcessResult {
  processed: number;
  published: number;
  failed: number;
}