import { getSocket } from './socket';
type BroadcastCallback = (data: any) => void;
export function broadcast(event: string, data: any) { getSocket()?.emit('broadcast:' + event, data); }
export function subscribeToBroadcast(event: string, callback: BroadcastCallback) { getSocket()?.on('broadcast:' + event, callback); return () => getSocket()?.off('broadcast:' + event, callback); }
export function broadcastToAll(event: string, data: any) { getSocket()?.emit('broadcast:all', { event, data }); }
