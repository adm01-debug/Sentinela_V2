export class PubSubManager {
  private topics = new Map<string, Set<(data: any) => void>>();
  subscribe(topic: string, callback: (data: any) => void): () => void { if (!this.topics.has(topic)) this.topics.set(topic, new Set()); this.topics.get(topic)!.add(callback); return () => this.topics.get(topic)?.delete(callback); }
  publish(topic: string, data: any): void { this.topics.get(topic)?.forEach(cb => cb(data)); }
  unsubscribeAll(topic: string): void { this.topics.delete(topic); }
  getTopics(): string[] { return Array.from(this.topics.keys()); }
  getSubscriberCount(topic: string): number { return this.topics.get(topic)?.size || 0; }
}
export const pubsubManager = new PubSubManager();
