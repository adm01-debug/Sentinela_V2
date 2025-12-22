export interface HubspotConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface HubspotResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface HubspotEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}