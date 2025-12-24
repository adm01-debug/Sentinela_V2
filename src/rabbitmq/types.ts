export interface RabbitMQConfig {
  url: string;
  heartbeat: number;
  prefetch: number;
}

export interface ExchangeConfig {
  name: string;
  type: 'direct' | 'fanout' | 'topic' | 'headers';
  durable: boolean;
  autoDelete: boolean;
}

export interface QueueConfig {
  name: string;
  durable: boolean;
  exclusive: boolean;
  autoDelete: boolean;
  deadLetterExchange?: string;
  messageTtl?: number;
}

export interface RabbitMessage {
  content: unknown;
  properties: MessageProperties;
}

export interface MessageProperties {
  contentType: string;
  correlationId?: string;
  replyTo?: string;
  expiration?: string;
  messageId?: string;
  timestamp?: number;
  headers?: Record<string, unknown>;
}