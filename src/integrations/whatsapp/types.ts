export interface WhatsappConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface WhatsappResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}