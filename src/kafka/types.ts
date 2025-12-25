export interface KafkaConfig { brokers: string[]; groupId?: string; }
export interface Message { key?: string; value: string; partition?: number; }
