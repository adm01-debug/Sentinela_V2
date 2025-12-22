export interface JiraConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface JiraResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface JiraEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}