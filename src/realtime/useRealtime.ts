import { useEffect, useState, useCallback } from 'react';
import { connect, disconnect, on, off, emit, getSocket } from './socket';
export function useRealtime(url: string, token?: string) {
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => { const socket = connect(url, token); socket.on('connect', () => setIsConnected(true)); socket.on('disconnect', () => setIsConnected(false)); return () => disconnect(); }, [url, token]);
  return { isConnected, emit, on, off };
}
export function useRealtimeEvent<T>(event: string, callback: (data: T) => void) { useEffect(() => { on(event, callback); return () => off(event, callback); }, [event, callback]); }
export function useRealtimeChannel<T>(channel: string) {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => { emit('join', channel); on('channel:' + channel, setData); return () => { emit('leave', channel); off('channel:' + channel); }; }, [channel]);
  return data;
}
