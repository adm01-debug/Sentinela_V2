import { BrokerConfig, BrokerMessage, PublishOptions, SubscribeOptions } from './types';
import { Exchange } from './exchange';
import { MessageQueue } from './queue';
import { v4 as uuidv4 } from 'uuid';

export class MessageBroker {
  private exchanges: Map<string, Exchange> = new Map();
  private queues: Map<string, MessageQueue> = new Map();
  
  constructor(private config: BrokerConfig) {}
  
  createExchange(name: string, type: 'direct' | 'fanout' | 'topic'): Exchange {
    const exchange = new Exchange(name, type);
    this.exchanges.set(name, exchange);
    return exchange;
  }
  
  createQueue(name: string): MessageQueue {
    const queue = new MessageQueue(name, this.config.maxQueueSize);
    this.queues.set(name, queue);
    return queue;
  }
  
  bindQueue(queueName: string, exchangeName: string, routingKey: string): void {
    const exchange = this.exchanges.get(exchangeName);
    const queue = this.queues.get(queueName);
    if (exchange && queue) exchange.bind(routingKey, queue);
  }
  
  async publish(exchangeName: string, routingKey: string, payload: unknown, options?: PublishOptions): Promise<void> {
    const exchange = this.exchanges.get(exchangeName);
    if (!exchange) throw new Error('Exchange not found');
    const message: BrokerMessage = {
      id: uuidv4(), topic: routingKey, payload, headers: options?.headers ?? {}, timestamp: new Date(), ttl: options?.ttl
    };
    await exchange.publish(routingKey, message);
  }
  
  subscribe(queueName: string, handler: (message: BrokerMessage) => Promise<void>, options?: SubscribeOptions): void {
    const queue = this.queues.get(queueName);
    if (queue) queue.subscribe(handler, options);
  }
  
  getExchange(name: string): Exchange | undefined { return this.exchanges.get(name); }
  getQueue(name: string): MessageQueue | undefined { return this.queues.get(name); }
}