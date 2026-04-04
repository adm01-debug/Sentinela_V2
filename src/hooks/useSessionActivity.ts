import { useState, useEffect, useCallback } from 'react';

export interface SessionEvent {
  id: string;
  type: 'login' | 'logout' | 'action' | 'error' | 'security';
  timestamp: Date;
  description: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface UseSessionActivityOptions {
  maxEvents?: number;
  persistKey?: string;
}

export function useSessionActivity(options: UseSessionActivityOptions = {}) {
  const { maxEvents = 100, persistKey = 'session-activity' } = options;
  const [events, setEvents] = useState<SessionEvent[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = sessionStorage.getItem(persistKey);
    return stored ? JSON.parse(stored).map((e: Omit<SessionEvent, 'timestamp'> & { timestamp: string }) => ({ ...e, timestamp: new Date(e.timestamp) })) : [];
  });
  const [sessionStart] = useState(() => new Date());

  useEffect(() => {
    sessionStorage.setItem(persistKey, JSON.stringify(events));
  }, [events, persistKey]);

  const logEvent = useCallback((type: SessionEvent['type'], description: string, metadata?: Record<string, string | number | boolean>) => {
    const event: SessionEvent = { id: crypto.randomUUID(), type, timestamp: new Date(), description, metadata };
    setEvents(prev => [event, ...prev].slice(0, maxEvents));
    return event;
  }, [maxEvents]);

  const clearEvents = useCallback(() => setEvents([]), []);

  const getEventsByType = useCallback((type: SessionEvent['type']) => events.filter(e => e.type === type), [events]);

  const sessionDuration = Math.floor((Date.now() - sessionStart.getTime()) / 1000);

  return { events, logEvent, clearEvents, getEventsByType, sessionStart, sessionDuration, eventCount: events.length };
}

export default useSessionActivity;
