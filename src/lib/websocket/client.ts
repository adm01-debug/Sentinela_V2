type MessageHandler = (data: unknown) => void;
type ConnectionHandler = () => void;
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers = new Map<string, Set<MessageHandler>>();
  private onConnectHandlers: ConnectionHandler[] = [];
  private onDisconnectHandlers: ConnectionHandler[] = [];
  constructor(url: string) { this.url = url; }
  connect(): void {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => { this.reconnectAttempts = 0; this.onConnectHandlers.forEach(h => h()); };
    this.ws.onclose = () => { this.onDisconnectHandlers.forEach(h => h()); this.reconnect(); };
    this.ws.onmessage = (event) => { const { type, data } = JSON.parse(event.data); this.handlers.get(type)?.forEach(h => h(data)); };
  }
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
  }
  disconnect(): void { this.ws?.close(); this.ws = null; }
  send(type: string, data: unknown): void { this.ws?.send(JSON.stringify({ type, data })); }
  on(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }
  onConnect(handler: ConnectionHandler): void { this.onConnectHandlers.push(handler); }
  onDisconnect(handler: ConnectionHandler): void { this.onDisconnectHandlers.push(handler); }
}
