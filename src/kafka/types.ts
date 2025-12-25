export interface KafkaConfig { brokers: string[]; clientId?: string; }
export interface Message { key?: string; value: string; partition?: number; timestamp?: string; }
