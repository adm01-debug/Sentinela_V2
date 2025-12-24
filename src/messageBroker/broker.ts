import { BrokerConfig, TopicConfig, PublishResult } from './types';
import { Topic } from './topic';
import { v4 as uuidv4 } from 'uuid';

export class MessageBroker {
  private topics: Map<string, Topic> = new Map();
  
  constructor(private config: BrokerConfig) {}
  
  createTopic(config: TopicConfig): Topic {
    if (this.topics.size >= this.config.maxTopics) throw new Error('Max topics reached');
    const topic = new Topic(config);
    this.topics.set(config.name, topic);
    return topic;
  }
  
  getTopic(name: string): Topic | undefined { return this.topics.get(name); }
  deleteTopic(name: string): boolean { return this.topics.delete(name); }
  listTopics(): string[] { return Array.from(this.topics.keys()); }
  
  async publish(topicName: string, message: unknown, key?: string): Promise<PublishResult> {
    const topic = this.topics.get(topicName);
    if (!topic) throw new Error('Topic not found: ' + topicName);
    const messageId = uuidv4();
    const partition = key ? this.hashKey(key, topic.getPartitionCount()) : 0;
    const offset = topic.publish(partition, { id: messageId, payload: message, timestamp: new Date() });
    return { messageId, topic: topicName, partition, offset };
  }
  
  private hashKey(key: string, partitions: number): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % partitions;
    return Math.abs(hash);
  }
}