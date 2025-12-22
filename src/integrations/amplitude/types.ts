export interface AmplitudeConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface AmplitudeResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AmplitudeEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}