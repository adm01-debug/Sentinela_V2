import { RabbitMQConnection } from './connection';
import { RabbitMessage } from './types';

export class RabbitSubscriber {
  private handlers: Map<string, (message: RabbitMessage) => Promise<void>> = new Map();
  
  constructor(private connection: RabbitMQConnection) {}
  
  async subscribe(queue: string, handler: (message: RabbitMessage) => Promise<void>): Promise<string> {
    if (!this.connection.isConnected()) throw new Error('Not connected');
    const tag = 'consumer_' + Date.now();
    this.handlers.set(tag, handler);
    return tag;
  }
  
  async unsubscribe(consumerTag: string): Promise<void> {
    this.handlers.delete(consumerTag);
  }
  
  async ack(message: RabbitMessage): Promise<void> { console.log('Acknowledged message'); }
  async nack(message: RabbitMessage, requeue: boolean = true): Promise<void> { console.log('Nacked message, requeue:', requeue); }
  async reject(message: RabbitMessage): Promise<void> { console.log('Rejected message'); }
}