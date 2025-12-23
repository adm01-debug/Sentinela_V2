import { getSocket } from './socket';
interface PresenceUser { id: string; name: string; status: 'online' | 'away' | 'busy'; }
type PresenceCallback = (users: PresenceUser[]) => void;
export function trackPresence(userId: string, name: string) { getSocket()?.emit('presence:join', { userId, name }); }
export function updateStatus(status: PresenceUser['status']) { getSocket()?.emit('presence:status', { status }); }
export function subscribeToPresence(callback: PresenceCallback) { getSocket()?.on('presence:update', callback); return () => getSocket()?.off('presence:update', callback); }
export function leavePresence() { getSocket()?.emit('presence:leave'); }
