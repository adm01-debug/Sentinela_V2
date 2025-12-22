export interface EmailConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface EmailResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface EmailEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}