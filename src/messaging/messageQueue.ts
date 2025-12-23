import { Message } from './messageService';
export class MessageQueue {
  private queue: Message[] = [];
  private processing = false;
  private processor: ((msg: Message) => Promise<void>) | null = null;
  setProcessor(processor: (msg: Message) => Promise<void>): void { this.processor = processor; }
  enqueue(msg: Message): void { this.queue.push(msg); if (!this.processing) this.process(); }
  private async process(): Promise<void> { if (!this.processor || this.processing) return; this.processing = true; while (this.queue.length > 0) { const msg = this.queue.shift()!; try { await this.processor(msg); } catch (e) { console.error('Message processing failed', e); } } this.processing = false; }
  size(): number { return this.queue.length; }
  clear(): void { this.queue = []; }
}
export const messageQueue = new MessageQueue();
