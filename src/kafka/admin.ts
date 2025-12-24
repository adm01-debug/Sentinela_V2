// Kafka Admin
export interface TopicConfig { name: string; partitions: number; replicationFactor: number; }
export class KafkaAdmin {
  private topics: Map<string, TopicConfig> = new Map();
  async createTopic(config: TopicConfig): Promise<void> { this.topics.set(config.name, config); console.log("[Kafka] Created topic:", config.name); }
  async deleteTopic(name: string): Promise<void> { this.topics.delete(name); }
  async listTopics(): Promise<string[]> { return Array.from(this.topics.keys()); }
  async describeTopic(name: string): Promise<TopicConfig | undefined> { return this.topics.get(name); }
}
