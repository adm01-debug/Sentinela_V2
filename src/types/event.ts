export interface Event {
  id: string;
  type: string;
  source: string;
  data: Record<string, unknown>;
  timestamp: string;
  processed: boolean;
  retryCount: number;
}