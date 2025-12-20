export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
  status?: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  last_triggered?: string;
  failure_count: number;
}

export interface NotificationPayload {
  user_id?: string;
  device_tokens?: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  priority?: 'high' | 'normal';
}

export interface AgentData {
  employee_id: string;
  device_id: string;
  data_type: 'screenshot' | 'activity' | 'application' | 'url' | 'keystroke' | 'system_info' | 'idle' | 'login' | 'logout';
  data: Record<string, unknown>;
  timestamp?: string;
  session_id?: string;
  agent_version?: string;
}
