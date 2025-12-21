import WebSocket from 'ws';

export function createWebSocketClient(url: string): WebSocket {
  const ws = new WebSocket(url);
  ws.on('open', () => console.log('Connected'));
  ws.on('error', (err) => console.error('WebSocket error:', err));
  return ws;
}