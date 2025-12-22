export interface GoogleworkspaceConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface GoogleworkspaceResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface GoogleworkspaceEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}