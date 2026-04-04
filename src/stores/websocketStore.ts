import { create } from 'zustand';
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
interface WebSocketState {
  status: ConnectionStatus;
  socket: WebSocket | null;
  lastMessage: unknown;
  reconnectAttempts: number;
  connect: (url) => void;
  disconnect: () => void;
  send: (data) => void;
  setStatus: (status: ConnectionStatus) => void;
  setLastMessage: (message) => void;
}
export const useWebSocketStore = create<WebSocketState>()((set, get) => ({
  status: 'disconnected',
  socket: null,
  lastMessage: null,
  reconnectAttempts: 0,
  connect: (url) => {
    set({ status: 'connecting' });
    const socket = new WebSocket(url);
    socket.onopen = () => set({ status: 'connected', socket, reconnectAttempts: 0 });
    socket.onclose = () => set({ status: 'disconnected', socket: null });
    socket.onerror = () => set({ status: 'error' });
    socket.onmessage = (e) => set({ lastMessage: JSON.parse(e.data) });
  },
  disconnect: () => { get().socket?.close(); set({ socket: null, status: 'disconnected' }); },
  send: (data) => { get().socket?.send(JSON.stringify(data)); },
  setStatus: (status) => set({ status }),
  setLastMessage: (lastMessage) => set({ lastMessage }),
}));