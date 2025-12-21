import Store from 'electron-store';

interface StoreSchema { apiKey?: string; userId?: string; settings: Record<string, unknown>; }

const store = new Store<StoreSchema>({ defaults: { settings: {} } });

export { store };