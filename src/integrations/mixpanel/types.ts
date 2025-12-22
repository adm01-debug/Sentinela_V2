export interface MixpanelConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface MixpanelResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface MixpanelEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}