export interface RealtimeEvent<T = unknown> {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  old?: T;
  new?: T;
  timestamp: string;
}

export interface RealtimeChannel {
  name: string;
  subscribe: () => void;
  unsubscribe: () => void;
  on: <T>(event: string, callback: (payload: T) => void) => void;
}