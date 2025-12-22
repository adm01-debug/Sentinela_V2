export interface Auth0Config {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface Auth0Response {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface Auth0Event {
  type: string;
  payload: unknown;
  timestamp: Date;
}