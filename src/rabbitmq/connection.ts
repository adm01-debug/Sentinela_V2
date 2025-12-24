import { RabbitMQConfig } from './types';
import { RabbitMQChannel } from './channel';

export class RabbitMQConnection {
  private connected: boolean = false;
  private channels: RabbitMQChannel[] = [];
  
  constructor(private config: RabbitMQConfig) {}
  
  async connect(): Promise<void> { this.connected = true; console.log('RabbitMQ connected'); }
  async close(): Promise<void> { 
    await Promise.all(this.channels.map(c => c.close()));
    this.connected = false;
  }
  
  async createChannel(): Promise<RabbitMQChannel> {
    if (!this.connected) throw new Error('Not connected');
    const channel = new RabbitMQChannel();
    this.channels.push(channel);
    return channel;
  }
  
  isConnected(): boolean { return this.connected; }
}