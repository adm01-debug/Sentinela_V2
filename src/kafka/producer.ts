import { KafkaConfig, ProducerMessage } from './types';

export class KafkaProducer {
  private connected: boolean = false;
  constructor(private config: KafkaConfig) {}
  
  async connect(): Promise<void> { this.connected = true; console.log('Kafka producer connected'); }
  async disconnect(): Promise<void> { this.connected = false; }
  
  async send(message: ProducerMessage): Promise<ProducerResult> {
    if (!this.connected) throw new Error('Producer not connected');
    return { topic: message.topic, partition: message.partition ?? 0, offset: Date.now().toString(), timestamp: new Date() };
  }
  
  async sendBatch(messages: ProducerMessage[]): Promise<ProducerResult[]> {
    return Promise.all(messages.map(m => this.send(m)));
  }
  
  isConnected(): boolean { return this.connected; }
}

export interface ProducerResult { topic: string; partition: number; offset: string; timestamp: Date; }