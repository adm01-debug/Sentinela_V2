export interface BrokerConfig {
  name: string;
  persistence: boolean;
  maxQueueSize: number;
}

export interface BrokerMessage {
  id: string;
  topic: string;
  payload: unknown;
  headers: Record<string, string>;
  timestamp: Date;
  ttl?: number;
}

export interface PublishOptions {
  persistent?: boolean;
  priority?: number;
  ttl?: number;
  headers?: Record<string, string>;
}

export interface SubscribeOptions {
  autoAck?: boolean;
  prefetch?: number;
  exclusive?: boolean;
}