import { io, Socket } from 'socket.io-client';
let socket: Socket | null = null;
export function connect(url: string, token?: string): Socket {
  socket = io(url, { auth: token ? { token } : undefined, transports: ['websocket'] });
  socket.on('connect', () => console.log('[Socket] Connected'));
  socket.on('disconnect', () => console.log('[Socket] Disconnected'));
  return socket;
}
export function disconnect() { socket?.disconnect(); socket = null; }
export function getSocket(): Socket | null { return socket; }
export function emit(event: string, data?: any) { socket?.emit(event, data); }
export function on(event: string, callback: (...args: any[]) => void) { socket?.on(event, callback); }
export function off(event: string, callback?: (...args: any[]) => void) { socket?.off(event, callback); }
