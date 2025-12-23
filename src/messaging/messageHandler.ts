import { Message } from './messageService';
export type HandlerFn = (msg: Message) => Promise<void> | void;
export class MessageHandler {
  private handlers = new Map<string, HandlerFn>();
  register(type: string, handler: HandlerFn): void { this.handlers.set(type, handler); }
  unregister(type: string): void { this.handlers.delete(type); }
  async handle(msg: Message): Promise<boolean> { const handler = this.handlers.get(msg.type); if (!handler) return false; await handler(msg); return true; }
  hasHandler(type: string): boolean { return this.handlers.has(type); }
  listHandlers(): string[] { return Array.from(this.handlers.keys()); }
}
export const messageHandler = new MessageHandler();
