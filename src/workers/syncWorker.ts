const ctx: Worker = self as any;

let syncInterval: NodeJS.Timeout | null = null;

ctx.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;
  
  switch (type) {
    case 'START_SYNC':
      startSync(payload.interval || 30000);
      break;
    case 'STOP_SYNC':
      stopSync();
      break;
    case 'SYNC_NOW':
      performSync();
      break;
  }
};

function startSync(interval: number) {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(performSync, interval);
  performSync();
}

function stopSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

async function performSync() {
  ctx.postMessage({ type: 'SYNC_START' });
  try {
    // Sync logic here
    ctx.postMessage({ type: 'SYNC_SUCCESS', payload: { timestamp: Date.now() } });
  } catch (error) {
    ctx.postMessage({ type: 'SYNC_ERROR', payload: { error: String(error) } });
  }
}

export {};
