export interface MailchimpConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface MailchimpResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface MailchimpEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}