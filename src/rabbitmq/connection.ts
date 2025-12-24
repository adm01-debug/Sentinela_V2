import { RabbitMQConfig, ExchangeConfig, QueueConfig } from './types';

export class RabbitMQConnection {
  private connected: boolean = false;
  private exchanges: Map<string, ExchangeConfig> = new Map();
  private queues: Map<string, QueueConfig> = new Map();
  
  constructor(private config: RabbitMQConfig) {}
  
  async connect(): Promise<void> { this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  isConnected(): boolean { return this.connected; }
  
  async declareExchange(config: ExchangeConfig): Promise<void> {
    this.exchanges.set(config.name, config);
  }
  
  async declareQueue(config: QueueConfig): Promise<void> {
    this.queues.set(config.name, config);
  }
  
  async bindQueue(queue: string, exchange: string, routingKey: string): Promise<void> {
    console.log('Bound', queue, 'to', exchange, 'with key', routingKey);
  }
  
  async deleteExchange(name: string): Promise<void> { this.exchanges.delete(name); }
  async deleteQueue(name: string): Promise<void> { this.queues.delete(name); }
}