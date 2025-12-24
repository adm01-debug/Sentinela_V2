export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  ssl?: boolean;
  sasl?: SASLConfig;
}

export interface SASLConfig {
  mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
  username: string;
  password: string;
}

export interface ProducerConfig {
  acks: 'all' | 0 | 1;
  retries: number;
  batchSize: number;
  lingerMs: number;
}

export interface ConsumerConfig {
  groupId: string;
  autoCommit: boolean;
  autoCommitInterval: number;
  fromBeginning: boolean;
}

export interface KafkaMessage {
  topic: string;
  partition?: number;
  key?: string;
  value: unknown;
  headers?: Record<string, string>;
  timestamp?: Date;
}