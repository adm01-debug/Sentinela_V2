export interface TelegramConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface TelegramResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}