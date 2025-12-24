export interface BrokerConfig { name: string; maxTopics: number; maxSubscribers: number; messageRetention: number; }
export interface TopicConfig { name: string; partitions: number; retentionMs: number; }
export interface PublishResult { messageId: string; topic: string; partition: number; offset: number; }