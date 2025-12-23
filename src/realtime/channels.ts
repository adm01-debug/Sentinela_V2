import { getSocket } from './socket';
export function joinChannel(channel: string) { getSocket()?.emit('join', channel); }
export function leaveChannel(channel: string) { getSocket()?.emit('leave', channel); }
export function subscribeToChannel(channel: string, callback: (data: any) => void) { joinChannel(channel); getSocket()?.on('channel:' + channel, callback); return () => { leaveChannel(channel); getSocket()?.off('channel:' + channel, callback); }; }
export function broadcastToChannel(channel: string, event: string, data: any) { getSocket()?.emit('broadcast', { channel, event, data }); }
