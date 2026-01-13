type Handler = (...args: any[]) => void;
const events = new Map<string, Set<Handler>>();
export const eventBus = {
  on: (event: string, handler: Handler) => { if (!events.has(event)) events.set(event, new Set()); events.get(event)!.add(handler); },
  off: (event: string, handler: Handler) => { events.get(event)?.delete(handler); },
  emit: (event: string, ...args: any[]) => { events.get(event)?.forEach(h => h(...args)); },
};
