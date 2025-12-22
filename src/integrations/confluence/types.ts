export interface ConfluenceConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface ConfluenceResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ConfluenceEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}