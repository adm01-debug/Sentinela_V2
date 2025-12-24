import { KafkaConfig, ProducerConfig, KafkaMessage } from './types';

export class KafkaProducer {
  private connected: boolean = false;
  private messageQueue: KafkaMessage[] = [];
  
  constructor(private config: KafkaConfig, private producerConfig: ProducerConfig) {}
  
  async connect(): Promise<void> { this.connected = true; console.log('Kafka producer connected'); }
  async disconnect(): Promise<void> { this.connected = false; }
  
  async send(message: KafkaMessage): Promise<RecordMetadata> {
    if (!this.connected) throw new Error('Producer not connected');
    this.messageQueue.push(message);
    if (this.messageQueue.length >= this.producerConfig.batchSize) await this.flush();
    return { topic: message.topic, partition: message.partition ?? 0, offset: '0', timestamp: new Date().toISOString() };
  }
  
  async sendBatch(messages: KafkaMessage[]): Promise<RecordMetadata[]> {
    return Promise.all(messages.map(m => this.send(m)));
  }
  
  async flush(): Promise<void> {
    console.log('Flushing', this.messageQueue.length, 'messages');
    this.messageQueue = [];
  }
}

export interface RecordMetadata {
  topic: string;
  partition: number;
  offset: string;
  timestamp: string;
}