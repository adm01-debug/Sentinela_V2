type EventHandler = (data: any) => void;
export class SseGateway {
  private source: EventSource | null = null;
  private handlers: Map<string, EventHandler> = new Map();
  connect(url: string) { this.source = new EventSource(url); this.source.onmessage = (e) => { const data = JSON.parse(e.data); this.handlers.forEach(h => h(data)); }; }
  disconnect() { this.source?.close(); this.source = null; }
  on(event: string, handler: EventHandler) { this.handlers.set(event, handler); this.source?.addEventListener(event, (e: any) => handler(JSON.parse(e.data))); }
  off(event: string) { this.handlers.delete(event); }
}
export const sseGateway = new SseGateway();
