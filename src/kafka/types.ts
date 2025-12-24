export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  ssl?: boolean;
  sasl?: SaslConfig;
}

export interface SaslConfig { mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512'; username: string; password: string; }

export interface ProducerMessage { topic: string; key?: string; value: unknown; headers?: Record<string, string>; partition?: number; }

export interface ConsumerMessage { topic: string; partition: number; offset: string; key?: string; value: unknown; headers: Record<string, string>; timestamp: string; }

export interface TopicConfig { name: string; partitions: number; replicationFactor: number; configs?: Record<string, string>; }