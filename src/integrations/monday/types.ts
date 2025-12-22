export interface MondayConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface MondayResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface MondayEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}