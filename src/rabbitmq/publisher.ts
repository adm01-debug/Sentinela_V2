/**
 * @fileoverview RabbitMQ publisher
 * @module @sentinela/core/rabbitmq
 * @version 13.0.0
 */

import { RabbitMQConnection } from './connection';
import { RabbitMessage, MessageProperties } from './types';

export class RabbitPublisher {
  constructor(private connection: RabbitMQConnection) {}
  
  async publish(exchange: string, routingKey: string, message: unknown, properties?: Partial<MessageProperties>): Promise<void> {
    if (!this.connection.isConnected()) throw new Error('Not connected');
    console.log('Publishing to', exchange, 'with key', routingKey);
  }
  
  async sendToQueue(queue: string, message: unknown, properties?: Partial<MessageProperties>): Promise<void> {
    if (!this.connection.isConnected()) throw new Error('Not connected');
    console.log('Sending to queue', queue);
  }
  
  async publishBatch(exchange: string, messages: Array<{ routingKey: string; content: unknown }>): Promise<void> {
    for (const msg of messages) await this.publish(exchange, msg.routingKey, msg.content);
  }
}