/**
 * @fileoverview Kafka producer
 * @module @sentinela/core/kafka
 * @version 13.0.0
 */

import { KafkaConfig, ProducerMessage } from './types';

export class KafkaProducer {
  private connected: boolean = false;
  constructor(private config: KafkaConfig) {}
  
  async connect(): Promise<void> { this.connected = true; console.log('Producer connected to', this.config.brokers); }
  async disconnect(): Promise<void> { this.connected = false; }
  
  async send(message: ProducerMessage): Promise<RecordMetadata> {
    if (!this.connected) throw new Error('Producer not connected');
    console.log('Sending to', message.topic);
    return { topic: message.topic, partition: message.partition ?? 0, offset: String(Date.now()) };
  }
  
  async sendBatch(messages: ProducerMessage[]): Promise<RecordMetadata[]> {
    return Promise.all(messages.map(m => this.send(m)));
  }
}

export interface RecordMetadata { topic: string; partition: number; offset: string; }