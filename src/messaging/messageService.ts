export interface Message { id: string; type: string; payload: any; timestamp: number; }
export class MessageService {
  private handlers = new Map<string, ((msg: Message) => void)[]>();
  subscribe(type: string, handler: (msg: Message) => void): () => void { if (!this.handlers.has(type)) this.handlers.set(type, []); this.handlers.get(type)!.push(handler); return () => { const handlers = this.handlers.get(type); if (handlers) this.handlers.set(type, handlers.filter(h => h !== handler)); }; }
  publish(type: string, payload: any): void { const msg: Message = { id: crypto.randomUUID(), type, payload, timestamp: Date.now() }; this.handlers.get(type)?.forEach(h => h(msg)); this.handlers.get('*')?.forEach(h => h(msg)); }
}
export const messageService = new MessageService();
