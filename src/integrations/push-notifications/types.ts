export interface PushnotificationsConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface PushnotificationsResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}