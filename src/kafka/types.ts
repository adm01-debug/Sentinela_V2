export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId?: string;
  ssl?: boolean;
  sasl?: SASLConfig;
}

export interface SASLConfig { mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512'; username: string; password: string; }

export interface ProducerMessage {
  topic: string;
  key?: string;
  value: unknown;
  headers?: Record<string, string>;
  partition?: number;
  timestamp?: Date;
}

export interface ConsumerMessage {
  topic: string;
  partition: number;
  offset: string;
  key?: string;
  value: unknown;
  headers: Record<string, string>;
  timestamp: Date;
}

export interface TopicConfig {
  topic: string;
  numPartitions: number;
  replicationFactor: number;
  config?: Record<string, string>;
}