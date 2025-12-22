export interface DiscordConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface DiscordResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface DiscordEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}