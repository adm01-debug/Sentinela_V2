export interface FreshdeskConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface FreshdeskResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface FreshdeskEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}