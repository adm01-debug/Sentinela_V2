import { useState, useEffect, useCallback } from "react";

interface SessionEvent {
  id: string;
  type: "login" | "logout" | "action" | "navigation" | "error";
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export function useSessionActivity(maxEvents = 100) {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [sessionStart] = useState(() => new Date());

  const logEvent = useCallback((type: SessionEvent["type"], description: string, metadata?: Record<string, any>) => {
    const event: SessionEvent = { id: crypto.randomUUID(), type, description, timestamp: new Date(), metadata };
    setEvents((prev) => [event, ...prev].slice(0, maxEvents));
  }, [maxEvents]);

  const logAction = useCallback((description: string, metadata?: Record<string, any>) => logEvent("action", description, metadata), [logEvent]);
  const logNavigation = useCallback((path: string) => logEvent("navigation", `Navegou para ${path}`, { path }), [logEvent]);
  const logError = useCallback((error: string, metadata?: Record<string, any>) => logEvent("error", error, metadata), [logEvent]);

  const getSessionDuration = useCallback(() => Math.floor((Date.now() - sessionStart.getTime()) / 1000), [sessionStart]);

  const clearEvents = useCallback(() => setEvents([]), []);

  const getEventsByType = useCallback((type: SessionEvent["type"]) => events.filter((e) => e.type === type), [events]);

  useEffect(() => { logEvent("login", "Sessão iniciada"); }, []);

  return { events, sessionStart, logEvent, logAction, logNavigation, logError, getSessionDuration, clearEvents, getEventsByType };
}

export default useSessionActivity;
