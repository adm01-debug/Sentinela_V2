const ctx: Worker = self as any;

const eventQueue: any[] = [];
let flushInterval: NodeJS.Timeout | null = null;

ctx.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;
  
  switch (type) {
    case 'TRACK_EVENT':
      eventQueue.push({ ...payload, timestamp: Date.now() });
      break;
    case 'START_FLUSH':
      startFlush(payload.interval || 10000);
      break;
    case 'FLUSH_NOW':
      flushEvents();
      break;
  }
};

function startFlush(interval: number) {
  if (flushInterval) clearInterval(flushInterval);
  flushInterval = setInterval(flushEvents, interval);
}

function flushEvents() {
  if (eventQueue.length === 0) return;
  const events = [...eventQueue];
  eventQueue.length = 0;
  ctx.postMessage({ type: 'EVENTS_FLUSHED', payload: { count: events.length } });
}

export {};
