import React, { createContext, useContext, useEffect, useState } from 'react';
import { connect, disconnect, getSocket } from './socket';
import type { Socket } from 'socket.io-client';
interface RealtimeContextType { socket: Socket | null; isConnected: boolean; }
const RealtimeContext = createContext<RealtimeContextType>({ socket: null, isConnected: false });
interface Props { url: string; token?: string; children: React.ReactNode; }
export function RealtimeProvider({ url, token, children }: Props) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => { const s = connect(url, token); setSocket(s); s.on('connect', () => setIsConnected(true)); s.on('disconnect', () => setIsConnected(false)); return () => disconnect(); }, [url, token]);
  return <RealtimeContext.Provider value={{ socket, isConnected }}>{children}</RealtimeContext.Provider>;
}
export const useRealtimeContext = () => useContext(RealtimeContext);
