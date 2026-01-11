// WebSocket Service for Sentinela v17

type MessageHandler = (data: unknown) => void;
type ConnectionHandler = () => void;

interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: string;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers = new Map<string, Set<MessageHandler>>();
  private connectionHandlers: { onConnect: ConnectionHandler[]; onDisconnect: ConnectionHandler[] } = { onConnect: [], onDisconnect: [] };
  private url: string = '';
  private isIntentionalClose = false;

  connect(url: string, token?: string): void {
    this.url = token ? `${url}?token=${token}` : url;
    this.isIntentionalClose = false;
    this.createConnection();
  }

  private createConnection(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.connectionHandlers.onConnect.forEach(handler => handler());
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        const handlers = this.messageHandlers.get(message.type);
        handlers?.forEach(handler => handler(message.payload));
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    this.socket.onclose = () => {
      this.connectionHandlers.onDisconnect.forEach(handler => handler());
      if (!this.isIntentionalClose) this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => this.createConnection(), delay);
  }

  disconnect(): void {
    this.isIntentionalClose = true;
    this.socket?.close();
    this.socket = null;
  }

  send(type: string, payload: unknown): void {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.send(JSON.stringify({ type, payload, timestamp: new Date().toISOString() }));
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) this.messageHandlers.set(type, new Set());
    this.messageHandlers.get(type)!.add(handler);
    return () => this.messageHandlers.get(type)?.delete(handler);
  }

  off(type: string, handler: MessageHandler): void {
    this.messageHandlers.get(type)?.delete(handler);
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.onConnect.push(handler);
    return () => { this.connectionHandlers.onConnect = this.connectionHandlers.onConnect.filter(h => h !== handler); };
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.onDisconnect.push(handler);
    return () => { this.connectionHandlers.onDisconnect = this.connectionHandlers.onDisconnect.filter(h => h !== handler); };
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
