export interface Channel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms';
  config: Record<string, unknown>;
  enabled: boolean;
  createdAt: string;
}