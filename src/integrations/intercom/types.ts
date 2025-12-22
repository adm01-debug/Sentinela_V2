export interface IntercomConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface IntercomResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface IntercomEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}