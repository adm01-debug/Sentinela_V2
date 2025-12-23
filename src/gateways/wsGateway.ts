type MessageHandler = (data: any) => void;
export class WsGateway {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  connect(url: string) { this.ws = new WebSocket(url); this.ws.onmessage = (e) => { const { type, data } = JSON.parse(e.data); this.handlers.get(type)?.forEach(h => h(data)); }; return new Promise<void>((res) => { this.ws!.onopen = () => res(); }); }
  disconnect() { this.ws?.close(); this.ws = null; }
  send(type: string, data: any) { this.ws?.send(JSON.stringify({ type, data })); }
  on(type: string, handler: MessageHandler) { if (!this.handlers.has(type)) this.handlers.set(type, new Set()); this.handlers.get(type)!.add(handler); return () => this.handlers.get(type)?.delete(handler); }
}
export const wsGateway = new WsGateway();
