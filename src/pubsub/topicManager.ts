export interface TopicConfig { name: string; persistent: boolean; maxSubscribers?: number; }
export class TopicManager {
  private topics = new Map<string, TopicConfig>();
  create(config: TopicConfig): void { this.topics.set(config.name, config); }
  delete(name: string): boolean { return this.topics.delete(name); }
  get(name: string): TopicConfig | undefined { return this.topics.get(name); }
  exists(name: string): boolean { return this.topics.has(name); }
  list(): TopicConfig[] { return Array.from(this.topics.values()); }
}
export const topicManager = new TopicManager();
